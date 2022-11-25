const User = require('../models/user');

module.exports = {
  index,
  addPost,
  deletePost
};

function index(req, res, next) {
  console.log(req.query)
  // Make the query object to use with user.find based up
  // the user has submitted the search form or now
  let modelQuery = req.query.name ? {name: new RegExp(req.query.name, 'i')} : {};
  // Default to sorting by name
  let sortKey = req.query.sort || 'name';
  User.find(modelQuery)
  .sort(sortKey).exec(function(err, users) {
    if (err) return next(err);
    // Passing search values, name & sortKey, for use in the EJS
    res.render('users/index', {
      users,
      user: req.user,
      name: req.query.name,
      sortKey
    });
  });
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