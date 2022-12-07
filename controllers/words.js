const User = require('../models/user')

module.exports = {
    deleteUnknown,
    addToKnown,
    addToUnknown
}

function addToKnown(req, res) {
  console.log(req.params.wId)
  User.findById(req.params.uId, function(err, user) {
    if (err) console.log(err)
    user.knownWords.push(req.params.wId)
    user.save(function(err) {
      if (err) console.log(err)
      console.log(user)
      res.redirect(`/learn/${req.params.uId}/${req.params.lang}`)
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
      res.redirect(`/learn/${req.params.uId}/${req.params.lang}`)
    })
  })
}

function deleteUnknown(req, res) {
    console.log(req.params.word)
    User.findById(req.params.id, function(err, user) {
      user.unknownWords.filter(word => word !== req.params.word)
      user.save()
      res.redirect(`/learn/${req.params.id}`)
    })
  }

