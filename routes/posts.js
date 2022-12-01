const router = require('express').Router()
const postsCtrl = require('../controllers/posts')

// GET
router.get('/:id/new-post', postsCtrl.newPost)
router.get('/:uId/delete-post/:pId', postsCtrl.deleteConfirm)
router.get('/:uId/edit-post/:pId', postsCtrl.edit)

// POST
router.post('/:id/posts', postsCtrl.create)
router.post('/:uId/posts/:pId', postsCtrl.update)

// DELETE
router.delete('/:uId/posts/:pId', postsCtrl.deletePost);

module.exports = router
