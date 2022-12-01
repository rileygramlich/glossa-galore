let router = require('express').Router()
let learnCtrl = require('../controllers/learn')

// GETS
router.get('/', learnCtrl.index)
router.get('/languages', learnCtrl.languages)
router.get('/:id', isLoggedIn, learnCtrl.index)

// POSTS
router.post('/know', learnCtrl.addToKnown)
router.post('/unknown', learnCtrl.addToUnknown)


function isLoggedIn(req, res, next) {
    if ( req.isAuthenticated() ) return next();
    res.redirect('/auth/google');
  }

module.exports = router