const User = require('../models/user')
const Post = require('../models/post')

module.exports = {
    newPost,
    create
}


// question: when you can use req.user.id vs params.id
// q: do you only use populate for referencing, and should always push if embedding?
function create(req, res) {
    console.log('creating post')
    console.log(req.params.id)
    console.log(req.body)
    User.findById(req.params.id, function(err, user) {
      user.posts.push(req.body)
      user.save(function(err) {
        console.log(user)
        res.redirect(`/users/${req.params.id}/feed`)
      })
    })
  }

function newPost(req, res) {
  res.render('posts/new', {
    user: req.user,
  })
}