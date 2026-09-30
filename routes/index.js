const router = require('express').Router()
const passport = require('passport')
const indexCtrl = require('../controllers/index')
const database = require('../config/database')

router.get('/', indexCtrl.index)
router.get('/login', indexCtrl.login)

// Whether the app can reach its database, and why not. Never includes the password.
router.get('/health', async (req, res) => {
  await database.ensureConnected().catch(() => {})
  const s = database.status()
  res.status(s.database === 'connected' ? 200 : 503).json(s)
})

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
