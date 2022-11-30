const User = require('../models/user');
const Post = require('../models/post')

module.exports = {
  index,
  addPost,
  deletePost,
  feed,
  newPost,
  create,
  getAllPosts
}

function index(req, res) {
  res.render('index', {
    user: req.user,
    })
}

function feed(req, res) {
  res.render('users/feed', {
    user: req.user
  })
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
    

    
//     function(err, user) {
//     console.log(user)
//     user.posts.push(req.body)
//     user.save()
//     res.redirect(`/users/${req.user.id}/feed`)
//   })
// }

function addPost(req, res) {
    console.log(`Adding post: req.body: ${req.body}`)
    res.redirect(`/users/${req.user.id}/feed`)
}

function deletePost(req, res) {
    console.log(`Deleting post: req.body: ${req.body}`)
    res.redirect('/')
}

function getAllPosts() {
  return Post.find()
}

// grab 1000 words api in the controller function