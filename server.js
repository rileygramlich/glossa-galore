const path = require('path')
const createError = require('http-errors')
const express = require('express')
const logger = require('morgan')
const helmet = require('helmet')
const methodOverride = require('method-override')
const session = require('express-session')
const { MongoStore } = require('connect-mongo')
const passport = require('passport')

require('dotenv').config({ quiet: true })

const { clientPromise, ensureConnected, isUnavailable } = require('./config/database')
const { ensureWords } = require('./config/words')
require('./config/passport')
const { locals } = require('./config/middleware')

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const learnRouter = require('./routes/learn')
const wordsRouter = require('./routes/words')
const postsRouter = require('./routes/posts')

const app = express()
const isProduction = app.get('env') === 'production'

// A fresh database gets the word bank on first start; the learn pages wait for it.
app.locals.wordsReady = clientPromise
  .then(ensureWords)
  .catch(err => console.error('Could not load the word bank:', err.message))

if (isProduction && !process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET must be set in production')
}

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
// Vercel, Render and most hosts terminate TLS at a proxy.
app.set('trust proxy', 1)

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      'img-src': ["'self'", 'data:', 'https://*.googleusercontent.com'],
      'style-src': ["'self'", 'https://fonts.googleapis.com'],
      // Progress meters set a CSS variable in a style attribute.
      'style-src-attr': ["'unsafe-inline'"],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      'upgrade-insecure-requests': isProduction ? [] : null
    }
  },
  strictTransportSecurity: isProduction
}))
app.use(logger(isProduction ? 'combined' : 'dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public'), { maxAge: isProduction ? '7d' : 0 }))
app.use(methodOverride('_method'))
const sessionStore = MongoStore.create({ clientPromise, touchAfter: 24 * 3600 })

// Signed-in visitors' sessions live in Mongo. If it's down, (re)connect or show the
// "can't reach the database" page, rather than waiting on the store. Guests without
// a session cookie skip this, so the home page and guest pages never need it.
app.use(async (req, res, next) => {
  if (!/(^|;\s*)connect\.sid=/.test(req.headers.cookie || '')) return next()
  await ensureConnected()
  next()
})

app.use(session({
  secret: process.env.SESSION_SECRET || 'glossa-dev-secret',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    maxAge: 1000 * 60 * 60 * 24 * 30
  }
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(locals)

app.use('/', indexRouter)
app.use('/feed', usersRouter)
app.use('/posts', postsRouter)
app.use('/learn', learnRouter)
app.use('/learn', wordsRouter)

app.use((req, res, next) => next(createError(404)))

app.use((err, req, res, next) => {
  // Already answered (e.g. the session failed to save after a redirect): let Express close it.
  if (res.headersSent) return next(err)
  // The error may have happened before `locals` ran (e.g. in the session store); the page header needs them.
  locals(req, res, () => {})
  const unavailable = isUnavailable(err)
  const status = err.status || (unavailable ? 503 : err.name === 'ValidationError' || err.name === 'CastError' ? 400 : 500)
  if (status >= 500) console.error(err)
  const message = status === 404 ? "We couldn't find that page."
    : unavailable ? "Glossa Galore can't reach its database right now. Please try again in a minute."
    : err.expose ? err.message : 'Something went wrong on our end.'
  res.status(status)
  if (req.accepts(['html', 'json']) === 'json') return res.json({ error: message })
  res.render('error', {
    status,
    message,
    error: isProduction ? null : err
  })
})

module.exports = app
