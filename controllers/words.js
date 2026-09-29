const createError = require('http-errors')
const mongoose = require('mongoose')
const User = require('../models/user')
const Word = require('../models/word')

const STATUSES = ['known', 'learning']

module.exports = {
  mark,
  remove,
  sync
}

// POST /learn/:lang/words/:wordId  { status: 'known' | 'learning' }
async function mark(req, res) {
  const { status } = req.body
  if (!STATUSES.includes(status)) throw createError(400, 'Status must be "known" or "learning".')
  const wordId = await findWordId(req.params.wordId)
  await User.setVocab(req.user._id, req.lang.code, wordId, status)
  res.json(await statsFor(req))
}

// DELETE /learn/:lang/words/:wordId
async function remove(req, res) {
  const wordId = await findWordId(req.params.wordId)
  await User.removeVocab(req.user._id, req.lang.code, wordId)
  res.json(await statsFor(req))
}

// POST /learn/:lang/sync  { known: [rank], learning: [rank] }
// Moves progress made as a guest into the account. Existing account progress wins.
async function sync(req, res) {
  const lang = req.lang.code
  const ranks = list => (Array.isArray(list) ? list.map(Number).filter(Number.isInteger).slice(0, 2000) : [])
  const known = new Set(ranks(req.body.known))
  const learning = ranks(req.body.learning).filter(r => !known.has(r))

  const words = await Word.find({ rank: { $in: [...known, ...learning] } }, 'rank')
  const already = new Set(req.user.vocabFor(lang).map(v => v.word.toString()))
  const additions = words
    .filter(w => !already.has(w.id))
    .map(w => ({ word: w._id, lang, status: known.has(w.rank) ? 'known' : 'learning' }))

  if (additions.length) {
    await User.updateOne({ _id: req.user._id }, { $push: { vocab: { $each: additions } } })
  }
  res.json({ added: additions.length, ...(await statsFor(req)) })
}

async function findWordId(id) {
  if (!mongoose.isValidObjectId(id) || !(await Word.exists({ _id: id }))) {
    throw createError(404, 'Word not found.')
  }
  return new mongoose.Types.ObjectId(String(id))
}

async function statsFor(req) {
  const user = await User.findById(req.user._id, 'vocab')
  return { stats: user.stats()[req.lang.code] }
}
