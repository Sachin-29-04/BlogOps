const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const db = require('../src/config/db');

jest.mock('../src/config/db');

describe('Auth & System Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /health returns 200 UP', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.timestamp).toBeDefined();
  });

  test('POST /register rejects requests with missing fields with 400', async () => {
    const res = await request(app)
      .post('/register')
      .send({ username: 'alice' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  test('POST /register successfully registers a new user', async () => {
    // Mock user lookup by email (not found)
    db.query.mockResolvedValueOnce({ rows: [] });
    // Mock user lookup by username (not found)
    db.query.mockResolvedValueOnce({ rows: [] });
    // Mock user insert
    db.query.mockResolvedValueOnce({
      rows: [{ id: 1, username: 'alice', email: 'alice@example.com', created_at: new Date() }],
    });

    const res = await request(app)
      .post('/register')
      .send({ username: 'alice', email: 'alice@example.com', password: 'password123' });

    expect(res.statusCode).toBe(201);
    expect(res.body.username).toBe('alice');
    expect(res.body.email).toBe('alice@example.com');
  });

  test('POST /login rejects invalid credentials with 401', async () => {
    // User not found in DB
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/login')
      .send({ email: 'nonexistent@example.com', password: 'wrong' });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch(/invalid email or password/i);
  });

  test('POST /login returns JWT token when credentials are valid', async () => {
    const hashedPassword = await bcrypt.hash('secretPass', 10);
    db.query.mockResolvedValueOnce({
      rows: [{ id: 1, username: 'alice', email: 'alice@example.com', password: hashedPassword }],
    });

    const res = await request(app)
      .post('/login')
      .send({ email: 'alice@example.com', password: 'secretPass' });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe('alice');
  });
});
