let router = require('express').Router()
let postsCtrl = require('../controllers/posts')

// GET
router.get('/:id/new-post', postsCtrl.newPost)

// POST
router.post('/:id/posts', postsCtrl.create)

// DELETE
// router.delete('/', usersCtrl.deletePost);

module.exports = router
