const router = require('express').Router()
const postsCtrl = require('../controllers/posts')

// GET
router.get('/:id/new-post', postsCtrl.newPost)
router.get('/:uId/delete-post/:pId', postsCtrl.deleteConfirm)

// POST
router.post('/:id/posts', postsCtrl.create)

// DELETE
router.delete('/:uId/posts/:pId', postsCtrl.deletePost);

module.exports = router
