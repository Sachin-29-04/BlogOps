const PostModel = require('../models/post.model');

const PostController = {
  async create(req, res, next) {
    try {
      const { title, content } = req.body;

      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required.' });
      }

      const newPost = await PostModel.create(title, content, req.user.id);
      return res.status(201).json(newPost);
    } catch (err) {
      next(err);
    }
  },

  async getAll(req, res, next) {
    try {
      const posts = await PostModel.findAll();
      return res.status(200).json(posts);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const post = await PostModel.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ error: 'Post not found.' });
      }
      return res.status(200).json(post);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { title, content } = req.body;
      const post = await PostModel.findById(req.params.id);

      if (!post) {
        return res.status(404).json({ error: 'Post not found.' });
      }

      // Authorization: Only the author can update
      if (post.author_id !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden: You are not authorized to update this post.' });
      }

      const updated = await PostModel.update(req.params.id, title, content);
      return res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const post = await PostModel.findById(req.params.id);

      if (!post) {
        return res.status(404).json({ error: 'Post not found.' });
      }

      // Authorization: Only the author can delete
      if (post.author_id !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden: You are not authorized to delete this post.' });
      }

      await PostModel.delete(req.params.id);
      return res.status(200).json({ message: 'Post deleted successfully.' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = PostController;
