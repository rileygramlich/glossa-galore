const mongoose = require('mongoose')

// One of the 1000 most common English words, with its translation in each language.
const wordSchema = new mongoose.Schema({
  rank: { type: Number, required: true, unique: true },
  en: { type: String, required: true },
  fr: String,
  pt: String,
  de: String
}, {
  timestamps: true
})

// The shape sent to the flashcard page for one language.
wordSchema.methods.toCard = function (lang) {
  return { id: this.id, rank: this.rank, en: this.en, word: this[lang] }
}

module.exports = mongoose.model('Word', wordSchema)
