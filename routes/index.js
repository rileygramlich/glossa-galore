const router = require('express').Router()
const passport = require('passport')
const indexCtrl = require('../controllers/index')

router.get('/', indexCtrl.index)
router.get('/login', indexCtrl.login)

// Google OAuth
router.get('/auth/google', indexCtrl.requireGoogle, passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'select_account'
}))
router.get('/oauth2callback', indexCtrl.requireGoogle, passport.authenticate('google', {
  failureRedirect: '/login',
  keepSessionInfo: true
}), indexCtrl.afterLogin)

router.post('/logout', indexCtrl.logout)

// Sign in as a local test user. Opt-in, and never available in production.
if (process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEV_LOGIN === 'true') {
  router.get('/dev/login', indexCtrl.devLogin)
}

module.exports = router
