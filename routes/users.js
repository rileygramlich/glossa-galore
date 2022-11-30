let router = require('express').Router()
var usersCtrl = require('../controllers/users');

// GET /users
router.get('/', usersCtrl.index);
router.get('/:id/feed', isLoggedIn, usersCtrl.feed)
router.get('/:id/new-post', isLoggedIn, usersCtrl.newPost)

router.post('/:id/posts', usersCtrl.create)

// DELETE /facts/:id
router.delete('/', usersCtrl.deletePost);

function isLoggedIn(req, res, next) {
  if ( req.isAuthenticated() ) return next();
  res.redirect('/auth/google');
}

module.exports = router;
