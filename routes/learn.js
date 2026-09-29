const router = require('express').Router()
const learnCtrl = require('../controllers/learn')
const { loadLanguage } = require('../config/middleware')

router.param('lang', loadLanguage)

// Open to guests. Signed-in users get their progress saved to their account.
router.get('/', learnCtrl.languages)
router.get('/:lang', learnCtrl.index)
router.get('/:lang/deck', learnCtrl.deck)

module.exports = router
