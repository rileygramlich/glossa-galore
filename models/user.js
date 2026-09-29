const mongoose = require('mongoose')
const postSchema = require('./post')
const { codes } = require('../config/languages')

const Schema = mongoose.Schema

// Progress on one word in one language. Words reference the shared word bank (many to many).
const vocabSchema = new Schema({
  word: { type: Schema.Types.ObjectId, ref: 'Word', required: true },
  lang: { type: String, enum: codes, required: true },
  status: { type: String, enum: ['known', 'learning'], required: true }
}, {
  timestamps: true
})

const userSchema = new Schema({
  name: String,
  email: String,
  avatar: String,
  googleId: { type: String, unique: true, sparse: true },
  vocab: [vocabSchema],
  posts: [postSchema]
}, {
  timestamps: true
})

// Mark a word as known or still learning. A word is only ever in one list per language.
// Atomic updates, so quick taps on the flashcards can't overwrite each other.
userSchema.statics.setVocab = async function (userId, lang, wordId, status) {
  const match = { word: wordId, lang }
  const updated = await this.updateOne(
    { _id: userId, vocab: { $elemMatch: match } },
    { $set: { 'vocab.$.status': status, 'vocab.$.updatedAt': new Date() } }
  )
  if (updated.matchedCount) return
  await this.updateOne(
    { _id: userId, vocab: { $not: { $elemMatch: match } } },
    { $push: { vocab: { ...match, status } } }
  )
}

userSchema.statics.removeVocab = function (userId, lang, wordId) {
  return this.updateOne({ _id: userId }, { $pull: { vocab: { word: wordId, lang } } })
}

userSchema.methods.vocabFor = function (lang) {
  return this.vocab.filter(v => v.lang === lang)
}

userSchema.methods.knownIds = function (lang) {
  return this.vocab.filter(v => v.lang === lang && v.status === 'known').map(v => v.word)
}

// { fr: { known, learning }, pt: ..., de: ... }
userSchema.methods.stats = function () {
  const stats = Object.fromEntries(codes.map(c => [c, { known: 0, learning: 0 }]))
  this.vocab.forEach(v => stats[v.lang][v.status]++)
  return stats
}

userSchema.virtual('firstName').get(function () {
  return (this.name || '').split(' ')[0]
})

module.exports = mongoose.model('User', userSchema)
