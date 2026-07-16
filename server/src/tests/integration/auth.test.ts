import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import User from '../../models/User.js';

// Mock the email service so we don't send emails during tests
vi.mock('../../config/emailService.js', () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
}));

describe('Auth API Integration Tests', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password123!',
  };

  beforeEach(async () => {
    // Note: Database is cleared after each test by setup.ts
    vi.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/Verification email sent/);

      // Verify user was created in DB
      const user = await User.findOne({ email: testUser.email });
      expect(user).toBeTruthy();
      expect(user?.name).toBe(testUser.name);
      // Password should be hashed
      expect(user?.password).not.toBe(testUser.password);
    });

    it('should fail if email is already registered', async () => {
      // Create user first
      await request(app).post('/api/v1/auth/register').send(testUser);

      // Try to register again
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(res.status).toBe(409); // Conflict
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Email already registered/);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Seed a user and mark them as verified so they can login
      const res = await request(app).post('/api/v1/auth/register').send(testUser);
      await User.updateOne({ email: testUser.email }, { isVerified: true });
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe(testUser.email);
      
      // Should set a refresh token cookie
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/refreshToken=/);
      expect(cookies[0]).toMatch(/HttpOnly/);
    });

    it('should fail with incorrect password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: 'WrongPassword1!' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail if user is not verified', async () => {
      // Revert user back to unverified
      await User.updateOne({ email: testUser.email }, { isVerified: false });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/verify your email/);
    });
  });

  describe('GET /api/v1/auth/refresh', () => {
    let refreshTokenCookie: string;

    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send(testUser);
      await User.updateOne({ email: testUser.email }, { isVerified: true });

      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      // Extract the refresh token cookie
      refreshTokenCookie = loginRes.headers['set-cookie'][0].split(';')[0];
    });

    it('should issue a new access token when provided a valid refresh token cookie', async () => {
      const res = await request(app)
        .get('/api/v1/auth/refresh')
        .set('Cookie', refreshTokenCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should fail if no refresh token cookie is provided', async () => {
      const res = await request(app).get('/api/v1/auth/refresh');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should clear the refresh token cookie', async () => {
      const res = await request(app).post('/api/v1/auth/logout');

      expect(res.status).toBe(200);
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/refreshToken=;/); // empty value
    });
  });
});
