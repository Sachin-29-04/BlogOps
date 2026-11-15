const express = require('express');
const router = express.Router();
const PostController = require('../controllers/post.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/posts', authenticate, PostController.create);
router.get('/posts', PostController.getAll);
router.get('/posts/:id', PostController.getById);
router.put('/posts/:id', authenticate, PostController.update);
router.delete('/posts/:id', authenticate, PostController.delete);

module.exports = router;
