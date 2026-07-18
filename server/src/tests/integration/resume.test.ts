import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { User } from '../../models/User.js';
import { Resume } from '../../models/Resume.js';
import { Buffer } from 'node:buffer';
import argon2 from 'argon2';

vi.mock('../../config/emailService.js', () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
}));
vi.mock('../../config/agenda.js', () => ({
  agenda: { schedule: vi.fn() },
}));

// Mock pdf-parse
vi.mock('pdf-parse', () => ({
  default: vi.fn().mockResolvedValue({ text: 'This is a mocked resume text containing software engineering skills.' }),
}));

// Mock aiService
vi.mock('../../services/aiService.js', () => ({
  analyzeResume: vi.fn().mockResolvedValue({
    overallVerdict: 'Strong',
    analysis: {
      strengths: ['The resume shows strong engineering skills.'],
      improvements: ['Add more metrics to your impact.'],
    },
    interviewQuestions: ['Tell me about a time you optimized a query.'],
    searchQueries: [{ query: 'software engineer AND "react" AND "node.js"', category: 'Technical' }],
  }),
}));

describe('Resume AI API Integration Tests', () => {
  const testUser = {
    name: 'User A',
    email: 'usera@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  };
  let cookie: string;

  beforeEach(async () => {
    vi.clearAllMocks();

    const hashedPassword = await argon2.hash(testUser.password);
    await User.create({ name: testUser.name, email: testUser.email, password: hashedPassword, isVerified: true, authProvider: 'email' });
    const login = await request(app).post('/api/v1/auth/login').send({ email: testUser.email, password: testUser.password });
    const rawCookies = login.headers['set-cookie'];
    const cookies = (Array.isArray(rawCookies) ? rawCookies : [rawCookies]).filter(Boolean) as string[];
    cookie = cookies.find(c => c.startsWith('accessToken='))!;
  });

  describe('POST /api/v1/resumes/analyze', () => {
    it('should analyze a resume successfully', async () => {
      // Create a dummy pdf buffer with magic bytes
      const dummyPdf = Buffer.from('%PDF-1.4 dummy pdf content');

      const res = await request(app)
        .post('/api/v1/resumes/analyze')
        .set('Cookie', cookie)
        .attach('resume', dummyPdf, { filename: 'resume.pdf', contentType: 'application/pdf' })
        .field('jobDescription', 'Looking for a software engineer.')
        .field('searchPreferences', 'Remote only');

      if (res.status !== 200) console.log(res.body);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail if no file is provided', async () => {
      const res = await request(app)
        .post('/api/v1/resumes/analyze')
        .set('Cookie', cookie)
        .field('jobDescription', 'Looking for a software engineer.');

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/No PDF file uploaded/i);
    });
  });

  describe('GET /api/v1/resumes', () => {
    it('should list all past analyses for the user', async () => {
      // Analyze one resume
      const dummyPdf = Buffer.from('%PDF-1.4 dummy pdf content');
      await request(app)
        .post('/api/v1/resumes/analyze')
        .set('Cookie', cookie)
        .attach('resume', dummyPdf, { filename: 'resume.pdf', contentType: 'application/pdf' });

      const res = await request(app)
        .get('/api/v1/resumes')
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });
  });
});
