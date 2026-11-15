const db = require('../config/db');

const PostModel = {
  async create(title, content, authorId) {
    const query = `
      INSERT INTO posts (title, content, author_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await db.query(query, [title, content, authorId]);
    return result.rows[0];
  },

  async findAll() {
    const query = `
      SELECT posts.*, users.username AS author
      FROM posts
      JOIN users ON posts.author_id = users.id
      ORDER BY posts.created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
  },

  async findById(id) {
    const query = `
      SELECT posts.*, users.username AS author
      FROM posts
      JOIN users ON posts.author_id = users.id
      WHERE posts.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  },

  async update(id, title, content) {
    const query = `
      UPDATE posts
      SET title = COALESCE($1, title),
          content = COALESCE($2, content),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    const result = await db.query(query, [title, content, id]);
    return result.rows[0];
  },

  async delete(id) {
    const query = `DELETE FROM posts WHERE id = $1 RETURNING id`;
    const result = await db.query(query, [id]);
    return result.rows[0];
  },
};

module.exports = PostModel;
