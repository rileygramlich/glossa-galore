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
mongoose.set('bufferTimeoutMS', TIMEOUT_MS)

mongoose.connection.on('connected', () => {
  const { host, name } = mongoose.connection
  console.log(`Connected to MongoDB ${name} at ${host}`)
})
mongoose.connection.on('error', err => console.error('MongoDB error:', err.message))

// Shared with the session store so the app holds a single connection pool.
const clientPromise = mongoose.connect(url, { serverSelectionTimeoutMS: TIMEOUT_MS })
  .then(m => m.connection.getClient())

// Say why: bad password, blocked IP (Atlas Network Access), wrong host...
// The driver's message names the host but never the password.
let lastError = null
clientPromise.catch(err => {
  lastError = err
  console.error(`Could not connect to MongoDB (${err.name}): ${err.message}`)
})

// For /health: is the database connected, and if not, why.
function status() {
  const connected = mongoose.connection.readyState === 1
  return {
    database: connected ? 'connected' : lastError ? 'error' : 'connecting',
    reason: connected || !lastError ? undefined : `${lastError.name}: ${lastError.message}`,
    urlSet: Boolean(process.env.DATABASE_URL),
    placeholderInUrl: /<[^>]*>/.test(url)
  }
}

// Errors that mean "the database isn't reachable", as opposed to a bug.
function isUnavailable(err) {
  return /MongooseServerSelectionError|MongoServerSelectionError|MongoNetworkError/.test(err.name)
    || /buffering timed out|bad auth|Authentication failed/i.test(err.message)
}

// Throw a 503 at once if the database never connected, instead of waiting on a query
// that can only time out.
function requireDatabase() {
  if (mongoose.connection.readyState === 1) return
  const err = new Error(`Can't reach the database. ${lastError ? `${lastError.name}: ${lastError.message}` : 'Still connecting.'}`)
  err.name = 'MongoServerSelectionError'
  throw err
}

module.exports = { clientPromise, isUnavailable, requireDatabase, status }
