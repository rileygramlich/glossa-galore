let mongoose = require('mongoose')

// Makes sense to put into two different files eh?
let wordSchema = new mongoose.Schema({
    rank: Number,
    en: String,
    fr: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Word', wordSchema)