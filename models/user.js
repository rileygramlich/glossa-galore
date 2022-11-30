let mongoose = require('mongoose')
var Schema = mongoose.Schema

// User schema
let userSchema = new Schema({
  name: String,
  email: String,
  avatar: String,
  googleId: String,
  knownWords: [String],
  unknownWords: [String]
}, {
  timestamps: true
});

// postsSchema

// wordsSchema

// wordBankSchema??

module.exports = mongoose.model('User', userSchema)

// populate