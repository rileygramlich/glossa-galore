const mongoose = require('mongoose')

// A visitor's "Suggest a language" note. Read them in Atlas: Browse Collections > suggestions.
const suggestionSchema = new mongoose.Schema({
  language: { type: String, required: true, trim: true, maxlength: 60 },
  message: { type: String, trim: true, maxlength: 1000 },
  replyTo: { type: String, trim: true, maxlength: 120 },
  page: { type: String, maxlength: 300 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // A salted hash of the sender's IP, only for rate limiting. Never the IP itself.
  sender: { type: String, index: true }
}, {
  timestamps: true
})

module.exports = mongoose.model('Suggestion', suggestionSchema)
