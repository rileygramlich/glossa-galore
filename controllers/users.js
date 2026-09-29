module.exports = {
  feed
}

// The signed-in user's profile and journal, newest post first.
function feed(req, res) {
  res.render('users/feed', {
    stats: req.user.stats(),
    posts: [...req.user.posts].reverse()
  })
}
