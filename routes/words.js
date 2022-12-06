let router = require('express').Router()
const wordsCtrl = require('../controllers/words')

// GETS

// POSTS
router.post('/:uId/addKnown/:wId', wordsCtrl.addToKnown)
router.post('/:uId/addUnknown/:wId', wordsCtrl.addToUnknown)

// DELETES
router.delete('/:id/deleteUnknown/:word', wordsCtrl.deleteUnknown)


module.exports = router