const mongoose = require('mongoose')

// Journal posts are embedded in the user who wrote them (one to many).
const postSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 140 },
  recentWords: { type: String, trim: true, maxlength: 280 },
  content: { type: String, required: true, trim: true, maxlength: 5000 }
}, {
  timestamps: true
})

module.exports = postSchema
