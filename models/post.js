let mongoose = require('mongoose')
var Schema = mongoose.Schema


let translatedPostSchema = new Schema({
  title: String,
  recentWords: String,
  content: String
}, {
  timestamps: true
}
)
// post schema
let postSchema = new Schema({
  title: String,
  recentWords: String,
  content: String,
  trnslatedPost: translatedPostSchema
}, {
  timestamps: true
})

module.exports = mongoose.model('Post', postSchema)

// populate