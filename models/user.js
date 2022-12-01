let mongoose = require('mongoose')
var Schema = mongoose.Schema

// Post
let postSchema = new Schema({
  title: String,
  recentWords: String,
  content: String
}, {
  timestamps: true
})

// User schema
let userSchema = new Schema({
  name: String,
  email: String,
  avatar: String,
  googleId: String,
  knownWords: [{ type: Schema.Types.ObjectId, ref: 'Word' }],
  unknownWords: [{ type: Schema.Types.ObjectId, ref: 'Word' }],
  posts: [postSchema]
}, {
  timestamps: true
})

// knownWords: [{ type: Schema.Types.ObjectId, ref: 'Word' }],
// unknownWords: [{ type: Schema.Types.ObjectId, ref: 'Word' }],
// comments: [commentsSchema]

// {type: Schema.Types.ObjectId, ref: 'Post'}

// postsSchema

// wordsSchema

// wordBankSchema??

module.exports = mongoose.model('User', userSchema)

// populate