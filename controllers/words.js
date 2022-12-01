const User = require('../models/user')

module.exports = {
    deleteUnknown
}

function deleteUnknown(req, res) {
    console.log(req.params.word)
    User.findById(req.params.id, function(err, user) {
      user.unknownWords.filter(word => word !== req.params.word)
      user.save()
      res.redirect(`/learn/${req.params.id}`)
    })
  }

