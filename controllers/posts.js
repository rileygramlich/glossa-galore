const User = require('../models/user')
const Post = require('../models/post')

module.exports = {
    newPost,
    create,
    deleteConfirm,
    deletePost
}

function newPost(req, res) {
  res.render('posts/new', {
    user: req.user,
  })
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

function deleteConfirm(req, res) {
    console.log('rendering delete page')
    console.log(req.params)
    // first we gotta get the correct post to delete through the params
    User.findById(req.params.uId, function(err, user) {
        let post = user.posts.id(req.params.pId)
        console.log(post)
        res.render('posts/delete', {
            user: user,
            post: post
        })

    })
}

function deletePost(req, res) {
    User.findById(req.params.uId, function(err, user) {
        user.posts.id(req.params.pId).remove()
        user.save()
        res.redirect(`/users/${req.params.uId}/feed`)
    })
}