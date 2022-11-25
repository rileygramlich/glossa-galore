let router = require('express').Router()

var usersCtrl = require('../controllers/users');

// GET /users
router.get('/', usersCtrl.index);

// POST 
// We will already have access to the logged in student on
// the server, therefore do not use: 
router.post('/', isLoggedIn, usersCtrl.addPost);

// DELETE /facts/:id
router.delete('/', usersCtrl.deletePost);

function isLoggedIn(req, res, next) {
  if ( req.isAuthenticated() ) return next();
  res.redirect('/auth/google');
}

module.exports = router;
