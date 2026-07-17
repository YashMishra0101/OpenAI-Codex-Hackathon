import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { User } from '../../models/User.js';
import { Resume } from '../../models/Resume.js';
import { Buffer } from 'node:buffer';

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
    overallVerdict: 'Strong Match',
    analysis: 'The resume shows strong engineering skills.',
    improvementSuggestions: ['Add more metrics to your impact.'],
    interviewQuestions: ['Tell me about a time you optimized a query.'],
    advancedSearchQueries: ['software engineer AND "react" AND "node.js"'],
  }),
}));

describe('Resume AI API Integration Tests', () => {
  const testUser = { name: 'User A', email: 'usera@example.com', password: 'Password123!' };
  let token: string;

  beforeEach(async () => {
    vi.clearAllMocks();

    await request(app).post('/api/v1/auth/register').send(testUser);
    await User.updateOne({ email: testUser.email }, { isVerified: true });
    const login = await request(app).post('/api/v1/auth/login').send({ email: testUser.email, password: testUser.password });
    token = login.body.data.accessToken;
  });

  describe('POST /api/v1/resumes/analyze', () => {
    it('should analyze a resume successfully', async () => {
      // Create a dummy pdf buffer
      const dummyPdf = Buffer.from('dummy pdf content');

      const res = await request(app)
        .post('/api/v1/resumes/analyze')
        .set('Authorization', `Bearer ${token}`)
        .attach('resume', dummyPdf, 'resume.pdf')
        .field('jobDescription', 'Looking for a software engineer.')
        .field('searchPreferences', 'Remote only');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.aiAnalysis.overallVerdict).toBe('Strong Match');

      // Verify it was saved to DB
      const count = await Resume.countDocuments();
      expect(count).toBe(1);
    });

    it('should fail if no file is provided', async () => {
      const res = await request(app)
        .post('/api/v1/resumes/analyze')
        .set('Authorization', `Bearer ${token}`)
        .field('jobDescription', 'Looking for a software engineer.');

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/No resume file uploaded/i);
    });
  });

  describe('GET /api/v1/resumes', () => {
    it('should list all past analyses for the user', async () => {
      // Analyze one resume
      const dummyPdf = Buffer.from('dummy pdf content');
      await request(app)
        .post('/api/v1/resumes/analyze')
        .set('Authorization', `Bearer ${token}`)
        .attach('resume', dummyPdf, 'resume.pdf');

      const res = await request(app)
        .get('/api/v1/resumes')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.resumes.length).toBe(1);
    });
  });
});
