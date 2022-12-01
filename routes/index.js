let router = require('express').Router()
const passport = require('passport');
let indexCtrl = require('../controllers/index')
const request = require('request')

// The root route renders our only view
router.get('/', indexCtrl.index)

// Google OAuth login route
router.get('/auth/google', passport.authenticate(
  'google',
  { scope: ['profile', 'email'] }
));

// Google OAuth callback route
router.get('/oauth2callback', passport.authenticate(
  'google',
  {
    successRedirect : `/users`,
    failureRedirect : '/users'
  }
));

// OAuth logout route
router.get('/logout', function(req, res){
  req.logout(function(err) {
    if (err) { return next(err); }
  })
  res.redirect('/')
})



module.exports = router;