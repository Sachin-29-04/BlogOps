const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const db = require('../src/config/db');
const { JWT_SECRET } = require('../src/middleware/auth.middleware');

jest.mock('../src/config/db');

describe('Post Endpoints', () => {
  const aliceToken = jwt.sign({ id: 1, username: 'alice' }, JWT_SECRET);
  const bobToken = jwt.sign({ id: 2, username: 'bob' }, JWT_SECRET);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /posts rejects unauthenticated requests with 401', async () => {
    const res = await request(app)
      .post('/posts')
      .send({ title: 'My Post', content: 'Some body' });

    expect(res.statusCode).toBe(401);
  });

  test('POST /posts creates a post when user is authenticated', async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: 10, title: 'Clean Architecture', content: 'Modular code', author_id: 1 }],
    });

    const res = await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ title: 'Clean Architecture', content: 'Modular code' });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Clean Architecture');
  });

  test('GET /posts returns list of posts', async () => {
    db.query.mockResolvedValueOnce({
      rows: [
        { id: 10, title: 'Post 1', content: 'Content 1', author: 'alice', author_id: 1 },
      ],
    });

    const res = await request(app).get('/posts');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });

  test('GET /posts/:id returns 404 if post does not exist', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/posts/999');
    expect(res.statusCode).toBe(404);
  });

  test('PUT /posts/:id returns 403 if non-author attempts edit', async () => {
    // Post exists with author_id = 1 (alice)
    db.query.mockResolvedValueOnce({
      rows: [{ id: 10, title: 'Post 1', content: 'Content', author_id: 1 }],
    });

    // Bob attempts to update Alice's post
    const res = await request(app)
      .put('/posts/10')
      .set('Authorization', `Bearer ${bobToken}`)
      .send({ title: 'Hacked Title' });

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/Forbidden/i);
  });

  test('DELETE /posts/:id returns 403 if non-author attempts deletion', async () => {
    // Post belongs to Alice (author_id = 1)
    db.query.mockResolvedValueOnce({
      rows: [{ id: 10, title: 'Post 1', author_id: 1 }],
    });

    // Bob tries to delete it
    const res = await request(app)
      .delete('/posts/10')
      .set('Authorization', `Bearer ${bobToken}`);

    expect(res.statusCode).toBe(403);
  });

  test('DELETE /posts/:id deletes post when requested by author', async () => {
    // Post belongs to Alice (author_id = 1)
    db.query.mockResolvedValueOnce({
      rows: [{ id: 10, title: 'Post 1', author_id: 1 }],
    });
    // Delete query resolves
    db.query.mockResolvedValueOnce({ rows: [{ id: 10 }] });

    const res = await request(app)
      .delete('/posts/10')
      .set('Authorization', `Bearer ${aliceToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/i);
  });
});
