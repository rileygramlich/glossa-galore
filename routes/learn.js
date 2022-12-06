let router = require('express').Router()
let learnCtrl = require('../controllers/learn')

// GETS
router.get('/', learnCtrl.index)
router.get('/:id/languages', learnCtrl.languages)
router.get('/:id/:lang', learnCtrl.index)

// POSTS

router.post('/:id/languages', learnCtrl.learnLang)

// DELETES

function isLoggedIn(req, res, next) {
    if ( req.isAuthenticated() ) return next();
    res.redirect('/auth/google');
  }

module.exports = router