const router = require('express').Router()
const usersCtrl = require('../controllers/users')
const { isLoggedIn } = require('../config/middleware')

// GET /feed
router.get('/', isLoggedIn, usersCtrl.feed)

module.exports = router
