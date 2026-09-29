const mongoose = require('mongoose')

const url = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/glossa-galore'

mongoose.connection.on('connected', () => {
  const { host, port, name } = mongoose.connection
  console.log(`Connected to MongoDB ${name} at ${host}:${port}`)
})
mongoose.connection.on('error', err => console.error('MongoDB error:', err.message))

// Shared with the session store so the app holds a single connection pool.
const clientPromise = mongoose.connect(url).then(m => m.connection.getClient())

module.exports = { clientPromise }
