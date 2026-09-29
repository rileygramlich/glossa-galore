const router = require('express').Router()
const wordsCtrl = require('../controllers/words')
const { isLoggedIn, loadLanguage } = require('../config/middleware')

router.param('lang', loadLanguage)

// POST
router.post('/:lang/words/:wordId', isLoggedIn, wordsCtrl.mark)
router.post('/:lang/sync', isLoggedIn, wordsCtrl.sync)

// DELETE
router.delete('/:lang/words/:wordId', isLoggedIn, wordsCtrl.remove)

module.exports = router
