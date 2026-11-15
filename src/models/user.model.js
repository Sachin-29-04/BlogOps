const db = require('../config/db');

const UserModel = {
  async create(username, email, hashedPassword) {
    const query = `
      INSERT INTO users (username, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, created_at
    `;
    const result = await db.query(query, [username, email, hashedPassword]);
    return result.rows[0];
  },

  async findByEmail(email) {
    const query = `SELECT * FROM users WHERE email = $1`;
    const result = await db.query(query, [email]);
    return result.rows[0];
  },

  async findByUsername(username) {
    const query = `SELECT * FROM users WHERE username = $1`;
    const result = await db.query(query, [username]);
    return result.rows[0];
  },

  async findById(id) {
    const query = `SELECT id, username, email, created_at FROM users WHERE id = $1`;
    const result = await db.query(query, [id]);
    return result.rows[0];
  },
};

module.exports = UserModel;
