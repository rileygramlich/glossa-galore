let mongoose = require('mongoose')
var Schema = mongoose.Schema

// post schema
let postSchema = new Schema({
  title: String,
  recentWords: String,
  content: String
}, {
  timestamps: true
})


module.exports = mongoose.model('Post', postSchema)

// populate