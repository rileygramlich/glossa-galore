const User = require('../models/user')
const Word = require('../models/word')
const top1000 = require('../config/top1000')

module.exports = {
    index,
    languages,
    learnLang
}

async function index(req, res) {
  let user = await User.findById(req.user.id).populate('knownWords').populate('unknownWords')
  let wordBank = await Word.find({})
  res.render('learn/index', {
    user: user,
    topWords: top1000.words,
    wordBank: wordBank,
    lang: req.params.lang
    })
}

function languages(req, res) {
  res.render('learn/languages', {
    user: req.user,
    topWords: top1000.words
  })
}

function learnLang(req, res) {
  console.log(req.body)
  res.redirect(`/learn/${req.user.id}/${req.body.language}`)
}