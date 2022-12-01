const User = require('../models/user');
const Post = require('../models/post')

module.exports = {
  index,
  feed,
  totalFeed
}

function index(req, res) {
  res.render('index', {
    user: req.user,
    })
}

async function totalFeed(req, res) {
  let users = await User.find({})
  res.render('users/feed', {
    users,
    user: req.user
  })
}

function feed(req, res) {
  res.render('users/feed', {
    user: req.user
  })
}



    
//     function(err, user) {
//     console.log(user)
//     user.posts.push(req.body)
//     user.save()
//     res.redirect(`/users/${req.user.id}/feed`)
//   })
// }

// function addPost(req, res) {
//     console.log(`Adding post: req.body: ${req.body}`)
//     res.redirect(`/users/${req.user.id}/feed`)
// }

// function deletePost(req, res) {
//     console.log(`Deleting post: req.body: ${req.body}`)
//     res.redirect('/')
// }

// function getAllPosts() {
//   return Post.find()
// }

// grab 1000 words api in the controller function