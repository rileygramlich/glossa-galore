const router = require('express').Router()
const postsCtrl = require('../controllers/posts')
const { isLoggedIn } = require('../config/middleware')

// Posts belong to the signed-in user, so every route works on req.user's own posts.
router.use(isLoggedIn)

// GET
router.get('/new', postsCtrl.newPost)
router.get('/:id/edit', postsCtrl.edit)
router.get('/:id/delete', postsCtrl.deleteConfirm)

// POST / PUT
router.post('/', postsCtrl.create)
router.put('/:id', postsCtrl.update)

// DELETE
router.delete('/:id', postsCtrl.deletePost)

module.exports = router
