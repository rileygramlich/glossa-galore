const createError = require('http-errors')
const Word = require('../models/word')

module.exports = {
  newPost,
  create,
  edit,
  update,
  deleteConfirm,
  deletePost
}

const fields = body => ({
  title: body.title,
  recentWords: body.recentWords,
  content: body.content
})

// Posts are embedded in req.user, so a post id from another user simply isn't found.
function findPost(req) {
  const post = req.user.posts.id(req.params.id)
  if (!post) throw createError(404)
  return post
}

async function newPost(req, res) {
  res.render('posts/new', {
    post: { recentWords: await recentWords(req.user) }
  })
}

async function create(req, res) {
  req.user.posts.push(fields(req.body))
  await req.user.save()
  res.redirect('/feed')
}

function edit(req, res) {
  res.render('posts/edit', { post: findPost(req) })
}

async function update(req, res) {
  findPost(req).set(fields(req.body))
  await req.user.save()
  res.redirect('/feed')
}

function deleteConfirm(req, res) {
  res.render('posts/delete', { post: findPost(req) })
}

async function deletePost(req, res) {
  findPost(req).deleteOne()
  await req.user.save()
  res.redirect('/feed')
}

// Suggest the five words most recently marked as known, to use in the post.
async function recentWords(user) {
  const recent = user.vocab
    .filter(v => v.status === 'known')
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 5)
  const words = await Word.find({ _id: { $in: recent.map(v => v.word) } })
  const byId = new Map(words.map(w => [w.id, w]))
  return recent
    .map(v => byId.get(v.word.toString())?.[v.lang])
    .filter(Boolean)
    .join(', ')
}
