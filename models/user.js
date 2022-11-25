let mongoose = require('mongoose')

// User schema
let userSchema = new mongoose.Schema({
  name: String,
  email: String,
  avatar: String,
  googleId: String
}, {
  timestamps: true
});

// postsSchema

// wordsSchema

// wordBankSchema??

module.exports = mongoose.model('User', userSchema)