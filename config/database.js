const mongoose = require('mongoose')

const url = (process.env.DATABASE_URL || '').trim() || 'mongodb://127.0.0.1:27017/glossa-galore'

if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set, so the app is trying a local MongoDB that does not exist here.')
}
if (/<[^>]*>/.test(url)) {
  console.error('DATABASE_URL still contains a <placeholder>. Replace it, angle brackets included, with the real value.')
}

// Give up quickly when the database is unreachable, so visitors get a clear error
// page in seconds instead of a hung request.
const TIMEOUT_MS = 8000
const RETRY_AFTER_MS = 5000
mongoose.set('bufferTimeoutMS', TIMEOUT_MS)

mongoose.connection.on('connected', () => {
  const { host, name } = mongoose.connection
  console.log(`Connected to MongoDB ${name} at ${host}`)
})
mongoose.connection.on('error', err => console.error('MongoDB error:', err.message))

let lastError = null
let lastAttempt = 0
let connecting = null

/**
 * Connect, or reconnect after a failure. A failed attempt used to leave the
 * instance broken until it was replaced; now the next request that needs the
 * database tries again (at most every few seconds). Rejects when it can't connect.
 */
function ensureConnected() {
  if (mongoose.connection.readyState === 1) return Promise.resolve()
  if (connecting) return connecting
  if (lastError && Date.now() - lastAttempt < RETRY_AFTER_MS) return Promise.reject(lastError)
  lastAttempt = Date.now()
  connecting = mongoose.connect(url, { serverSelectionTimeoutMS: TIMEOUT_MS })
    .then(() => { lastError = null })
    .catch(err => {
      lastError = err
      console.error(`Could not connect to MongoDB: ${describe(err)}`)
      throw err
    })
    .finally(() => { connecting = null })
  return connecting
}

// Start connecting as soon as the app loads. A failure is logged above.
ensureConnected().catch(() => {})

// The session store and the word-bank seeding wait on this. It resolves the first
// time the connection opens (after a retry, if need be) and never rejects.
const clientPromise = new Promise(resolve => {
  if (mongoose.connection.readyState === 1) return resolve(mongoose.connection.getClient())
  mongoose.connection.once('connected', () => resolve(mongoose.connection.getClient()))
})

/**
 * Why a connection failed. For Atlas, Mongoose's own message is always the generic
 * "IP isn't whitelisted" hint; the real per-server errors (timeout, TLS, closed
 * connection...) are underneath. Names hosts, never the password.
 */
function describe(err) {
  const servers = err.reason && err.reason.servers ? [...err.reason.servers.values()] : []
  const details = [...new Set(servers.map(s => s.error && s.error.message).filter(Boolean))]
  return details.length ? `${err.name}: ${details.join(' | ')}` : `${err.name}: ${err.message}`
}

// For /health: is the database connected, and if not, why.
function status() {
  const connected = mongoose.connection.readyState === 1
  return {
    database: connected ? 'connected' : lastError ? 'error' : 'connecting',
    reason: connected || !lastError ? undefined : describe(lastError),
    urlSet: Boolean(process.env.DATABASE_URL),
    placeholderInUrl: /<[^>]*>/.test(url)
  }
}

// Errors that mean "the database isn't reachable", as opposed to a bug.
function isUnavailable(err) {
  return /MongooseServerSelectionError|MongoServerSelectionError|MongoNetworkError/.test(err.name)
    || /buffering timed out|bad auth|Authentication failed/i.test(err.message)
}

// For routes that need the database: connect (or retry), or fail with a 503.
function requireDatabase() {
  return ensureConnected()
}

module.exports = { clientPromise, ensureConnected, requireDatabase, isUnavailable, status, describe }
