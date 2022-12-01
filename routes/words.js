let router = require('express').Router()
const wordsCtrl = require('../controllers/words')

// GETS

// POSTS

// DELETES
router.delete('/:id/deleteUnknown/:word', wordsCtrl.deleteUnknown)


module.exports = router