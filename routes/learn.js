let router = require('express').Router()

let learnCtrl = require('../controllers/learn')

router.get('/', learnCtrl.index)


module.exports = router