const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const db = require('../src/config/db');
const { JWT_SECRET } = require('../src/middleware/auth.middleware');

jest.mock('../src/config/db');

describe('Comment Endpoints', () => {
  const aliceToken = jwt.sign({ id: 1, username: 'alice' }, JWT_SECRET);
  const bobToken = jwt.sign({ id: 2, username: 'bob' }, JWT_SECRET);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /comments rejects unauthenticated requests with 401', async () => {
    const res = await request(app)
      .post('/comments')
      .send({ post_id: 1, content: 'Nice read' });

    expect(res.statusCode).toBe(401);
  });

  test('POST /comments requires post_id and content', async () => {
    const res = await request(app)
      .post('/comments')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ content: 'Missing post_id' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  test('POST /comments creates comment when authenticated', async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: 100, post_id: 1, content: 'Great article!', author_id: 1 }],
    });

    const res = await request(app)
      .post('/comments')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ post_id: 1, content: 'Great article!' });

    expect(res.statusCode).toBe(201);
    expect(res.body.content).toBe('Great article!');
  });

  test('GET /comments requires post_id query parameter', async () => {
    const res = await request(app).get('/comments');
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/post_id query parameter is required/i);
  });

  test('GET /comments?post_id=1 returns comments array', async () => {
    db.query.mockResolvedValueOnce({
      rows: [
        { id: 100, post_id: 1, content: 'Great article!', author: 'alice', author_id: 1 },
      ],
    });

    const res = await request(app).get('/comments?post_id=1');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].content).toBe('Great article!');
  });

  test('DELETE /comments/:id returns 403 if requested by non-author', async () => {
    // Comment belongs to Alice (author_id = 1)
    db.query.mockResolvedValueOnce({
      rows: [{ id: 100, author_id: 1 }],
    });

    // Bob tries to delete it
    const res = await request(app)
      .delete('/comments/100')
      .set('Authorization', `Bearer ${bobToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/Forbidden/i);
  });

  test('DELETE /comments/:id succeeds when requested by author', async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: 100, author_id: 1 }],
    });
    db.query.mockResolvedValueOnce({
      rows: [{ id: 100 }],
    });

    const res = await request(app)
      .delete('/comments/100')
      .set('Authorization', `Bearer ${aliceToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/i);
  });
});
