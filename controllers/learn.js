const User = require('../models/user');
const Words = require('../models/word')
const top1000 = require('../config/top1000')

module.exports = {
    index,
    addToKnown,
    addToUnknown,
    languages
}

function index(req, res) {
    res.render('learn/index', {
      user: req.user,
      topWords: top1000.words
    });
}

function addToKnown(req, res) {
  console.log(req.body)
  User.findById(req.user.id, function(err, user) {
    user.knownWords.push(req.body.known)
    user.save(function(err) {
      console.log(user)
      res.redirect(`/learn/${req.user.id}`)
    })
  })
}

function addToUnknown (req, res) {
  console.log(req.body)
  User.findById(req.user.id, function(err, user) {
    user.unknownWords.push(req.body.unknown)
    user.save(function(err) {
      console.log(user)
      res.redirect(`/learn/${req.user.id}`)
    })
  })
}

function languages (req, res) {
  res.render('learn/languages', {
    user: req.user,
    topWords: top1000.words
  })
}