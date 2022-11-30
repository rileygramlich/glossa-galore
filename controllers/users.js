const User = require('../models/user');

module.exports = {
  index,
  addPost,
  deletePost
};

function index(req, res) {
  res.render('index', {
    user: req.user,
    })
}

function addPost(req, res) {
    console.log(`Adding post: req.body: ${req.body}`)
    res.redirect('/')
}

function deletePost(req, res) {
    console.log(`Deleting post: req.body: ${req.body}`)
    res.redirect('/')
}

// grab 1000 words api in the controller function