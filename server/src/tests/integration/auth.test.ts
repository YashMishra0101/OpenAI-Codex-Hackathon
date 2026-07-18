import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { User } from '../../models/User.js';

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
      expect(res.body.message).toMatch(/verify your email/);

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
      expect(res.body.message).toMatch(/already exists/);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Seed a user and mark them as verified so they can login
      const res = await request(app).post('/api/v1/auth/register').send(testUser);
      await User.updateOne({ email: testUser.email }, { isVerified: true });
    });

    it('should login successfully with correct credentials', async () => {
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data.user.email).toBe(testUser.email);
      
      const rawCookies = loginResponse.headers['set-cookie'];
      expect(rawCookies).toBeDefined();
      const cookies = (Array.isArray(rawCookies) ? rawCookies : [rawCookies]).filter(Boolean) as string[];
      const accessTokenCookie = cookies.find((c: string) => c.startsWith('accessToken='));
      expect(accessTokenCookie).toBeDefined();
      const refreshTokenCookie = cookies.find((c: string) => c.startsWith('refreshToken='));
      expect(refreshTokenCookie).toBeDefined();
      expect(refreshTokenCookie).toMatch(/HttpOnly/);
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

  describe('POST /api/v1/auth/refresh', () => {
    let refreshTokenCookie: string;

    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send(testUser);
      await User.updateOne({ email: testUser.email }, { isVerified: true });

      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      // Extract the refresh token cookie
      const rawCookies = loginRes.headers['set-cookie'];
      const cookies = (Array.isArray(rawCookies) ? rawCookies : [rawCookies]).filter(Boolean) as string[];
      const refreshTokenHeader = cookies.find((c: string) => c.startsWith('refreshToken=')) || '';
      refreshTokenCookie = refreshTokenHeader.split(';')[0] || '';
    });

    it('should issue a new access token when provided a valid refresh token cookie', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', refreshTokenCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      
      const resCookies = res.headers['set-cookie'];
      expect(resCookies).toBeDefined();
      const cookiesArray = (Array.isArray(resCookies) ? resCookies : [resCookies]).filter(Boolean) as string[];
      const newAccessCookie = cookiesArray.find((c: string) => c.startsWith('accessToken='));
      expect(newAccessCookie).toBeDefined();
    });

    it('should fail if no refresh token cookie is provided', async () => {
      const res = await request(app).post('/api/v1/auth/refresh');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should clear the refresh token cookie', async () => {
      await request(app).post('/api/v1/auth/register').send(testUser);
      await User.updateOne({ email: testUser.email }, { isVerified: true });
      const loginRes = await request(app).post('/api/v1/auth/login').send({ email: testUser.email, password: testUser.password });
      
      const rawCookiesL = loginRes.headers['set-cookie'];
      const cookiesL = (Array.isArray(rawCookiesL) ? rawCookiesL : [rawCookiesL]).filter(Boolean) as string[];
      const cookieL = cookiesL.find(c => c.startsWith('accessToken='))!;

      const res = await request(app).post('/api/v1/auth/logout').set('Cookie', cookieL);

      expect(res.status).toBe(200);
      const rawCookies = res.headers['set-cookie'];
      const cookies = (Array.isArray(rawCookies) ? rawCookies : [rawCookies]).filter(Boolean) as string[];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/refreshToken=;/); // empty value
    });
  });
});
