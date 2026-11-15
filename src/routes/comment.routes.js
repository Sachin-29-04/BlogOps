const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/comment.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/comments', authenticate, CommentController.create);
router.get('/comments', CommentController.getByPostId);
router.get('/comments/:id', CommentController.getById);
router.put('/comments/:id', authenticate, CommentController.update);
router.delete('/comments/:id', authenticate, CommentController.delete);

module.exports = router;
