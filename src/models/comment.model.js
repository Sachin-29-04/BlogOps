const db = require('../config/db');

const CommentModel = {
  async create(postId, content, authorId) {
    const query = `
      INSERT INTO comments (post_id, content, author_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await db.query(query, [postId, content, authorId]);
    return result.rows[0];
  },

  async findByPostId(postId) {
    const query = `
      SELECT comments.*, users.username AS author
      FROM comments
      JOIN users ON comments.author_id = users.id
      WHERE comments.post_id = $1
      ORDER BY comments.created_at ASC
    `;
    const result = await db.query(query, [postId]);
    return result.rows;
  },

  async findById(id) {
    const query = `
      SELECT comments.*, users.username AS author
      FROM comments
      JOIN users ON comments.author_id = users.id
      WHERE comments.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  },

  async update(id, content) {
    const query = `
      UPDATE comments
      SET content = $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await db.query(query, [content, id]);
    return result.rows[0];
  },

  async delete(id) {
    const query = `DELETE FROM comments WHERE id = $1 RETURNING id`;
    const result = await db.query(query, [id]);
    return result.rows[0];
  },
};

module.exports = CommentModel;
