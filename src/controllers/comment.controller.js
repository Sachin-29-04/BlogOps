const CommentModel = require('../models/comment.model');

const CommentController = {
  async create(req, res, next) {
    try {
      const { post_id, content } = req.body;

      if (!post_id || !content) {
        return res.status(400).json({ error: 'post_id and content are required.' });
      }

      const comment = await CommentModel.create(post_id, content, req.user.id);
      return res.status(201).json(comment);
    } catch (err) {
      next(err);
    }
  },

  async getByPostId(req, res, next) {
    try {
      const { post_id } = req.query;

      if (!post_id) {
        return res.status(400).json({ error: 'post_id query parameter is required.' });
      }

      const comments = await CommentModel.findByPostId(post_id);
      return res.status(200).json(comments);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const comment = await CommentModel.findById(req.params.id);
      if (!comment) {
        return res.status(404).json({ error: 'Comment not found.' });
      }
      return res.status(200).json(comment);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { content } = req.body;
      const comment = await CommentModel.findById(req.params.id);

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found.' });
      }

      // Authorization: Only author can update
      if (comment.author_id !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden: You are not authorized to update this comment.' });
      }

      if (!content) {
        return res.status(400).json({ error: 'Content is required.' });
      }

      const updated = await CommentModel.update(req.params.id, content);
      return res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const comment = await CommentModel.findById(req.params.id);

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found.' });
      }

      // Authorization: Only author can delete
      if (comment.author_id !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden: You are not authorized to delete this comment.' });
      }

      await CommentModel.delete(req.params.id);
      return res.status(200).json({ message: 'Comment deleted successfully.' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = CommentController;
