let mongoose = require('mongoose')

// Makes sense to put into two different files eh?
let wordsSchema = new mongoose.Schema({
    words: [Object]
}, {
    timestamps: true
});

module.exports = mongoose.model('Words', wordsSchema)