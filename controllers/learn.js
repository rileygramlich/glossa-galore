const User = require('../models/user')
const Word = require('../models/word')
const top1000 = require('../config/top1000')

module.exports = {
    index,
    addToKnown,
    addToUnknown,
    languages
}

async function index(req, res) {
  let user = await User.findById(req.user.id).populate('knownWords').populate('unknownWords')
  let wordBank = await Word.find({})
  res.render('learn/index', {
    user: user,
    topWords: top1000.words,
    wordBank: wordBank
    })
}

function addToKnown(req, res) {
  console.log(req.params.wId)
  User.findById(req.params.uId, function(err, user) {
    if (err) console.log(err)
    user.knownWords.push(req.params.wId)
    user.save(function(err) {
      if (err) console.log(err)
      console.log(user)
      res.redirect(`/learn/${req.params.uId}`)
    })
  })
}

function addToUnknown(req, res) {
  console.log(req.params.wId)
  User.findById(req.params.uId, function(err, user) {
    if (err) console.log(err)
    user.unknownWords.push(req.params.wId)
    user.save(function(err) {
      if (err) console.log(err)
      console.log(user)
      res.redirect(`/learn/${req.params.uId}`)
    })
  })
}

function languages(req, res) {
  res.render('learn/languages', {
    user: req.user,
    topWords: top1000.words
  })
}

