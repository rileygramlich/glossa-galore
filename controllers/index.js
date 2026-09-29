const createError = require('http-errors')
const passport = require('passport')
const User = require('../models/user')

module.exports = {
  index,
  login,
  requireGoogle,
  afterLogin,
  logout,
  devLogin
}

function index(req, res) {
  res.render('index')
}

function login(req, res) {
  if (req.user) return res.redirect('/learn')
  res.render('login', {
    googleEnabled: Boolean(passport._strategy('google')),
    devLogin: process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEV_LOGIN === 'true'
  })
}

function requireGoogle(req, res, next) {
  if (passport._strategy('google')) return next()
  next(createError(503, 'Google sign-in is not configured.'))
}

function afterLogin(req, res) {
  const returnTo = req.session.returnTo || '/learn'
  delete req.session.returnTo
  res.redirect(returnTo)
}

function logout(req, res, next) {
  req.logout(err => {
    if (err) return next(err)
    res.redirect('/')
  })
}

async function devLogin(req, res, next) {
  const user = await User.findOneAndUpdate(
    { googleId: 'dev-user' },
    { $setOnInsert: { name: 'Test Learner', email: 'test@example.com' } },
    { new: true, upsert: true }
  )
  req.login(user, { keepSessionInfo: true }, err => {
    if (err) return next(err)
    afterLogin(req, res)
  })
}
