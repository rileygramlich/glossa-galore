let router = require('express').Router()
const wordsCtrl = require('../controllers/words')

// GETS

// POSTS
router.post('/:uId/:lang/addKnown/:wId', wordsCtrl.addToKnown)
router.post('/:uId/:lang/addUnknown/:wId', wordsCtrl.addToUnknown)

// DELETES
router.delete('/:id/deleteUnknown/:word', wordsCtrl.deleteUnknown)


module.exports = router