import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { User } from '../../models/User.js';
import { JobApplication } from '../../models/JobApplication.js';
import argon2 from 'argon2';

vi.mock('../../config/emailService.js', () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
}));
vi.mock('../../config/agenda.js', () => ({
  agenda: { schedule: vi.fn() },
}));

describe('Job API Integration Tests', () => {
  const testUserA = {
    name: 'User A',
    email: 'usera@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  };
  const testUserB = {
    name: 'User B',
    email: 'userb@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  };

  let cookieA: string;
  let cookieB: string;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Register and Verify User A
    const hashedPasswordA = await argon2.hash(testUserA.password);
    await User.create({ name: testUserA.name, email: testUserA.email, password: hashedPasswordA, isVerified: true, authProvider: 'email' });
    const loginA = await request(app).post('/api/v1/auth/login').send({ email: testUserA.email, password: testUserA.password });
    const rawCookiesA = loginA.headers['set-cookie'];
    const cookiesA = (Array.isArray(rawCookiesA) ? rawCookiesA : [rawCookiesA]).filter(Boolean) as string[];
    cookieA = cookiesA.find(c => c.startsWith('accessToken='))!;

    // Register and Verify User B
    const hashedPasswordB = await argon2.hash(testUserB.password);
    await User.create({ name: testUserB.name, email: testUserB.email, password: hashedPasswordB, isVerified: true, authProvider: 'email' });
    const loginB = await request(app).post('/api/v1/auth/login').send({ email: testUserB.email, password: testUserB.password });
    const rawCookiesB = loginB.headers['set-cookie'];
    const cookiesB = (Array.isArray(rawCookiesB) ? rawCookiesB : [rawCookiesB]).filter(Boolean) as string[];
    cookieB = cookiesB.find(c => c.startsWith('accessToken='))!;
  });

  describe('Job CRUD Operations', () => {
    const jobPayload = {
      companyName: 'Google',
      jobTitle: 'Software Engineer',
      status: 'Applied',
    };

    it('should create a job application', async () => {
      const res = await request(app)
        .post('/api/v1/jobs')
        .set('Cookie', cookieA)
        .send(jobPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.companyName).toBe(jobPayload.companyName);
      
      const count = await JobApplication.countDocuments();
      expect(count).toBe(1);
    });

    it('should list all jobs for the authenticated user', async () => {
      await request(app).post('/api/v1/jobs').set('Cookie', cookieA).send(jobPayload);
      await request(app).post('/api/v1/jobs').set('Cookie', cookieA).send({ ...jobPayload, companyName: 'Apple' });
      await request(app).post('/api/v1/jobs').set('Cookie', cookieB).send({ ...jobPayload, companyName: 'Meta' });

      const resA = await request(app)
        .get('/api/v1/jobs')
        .set('Cookie', cookieA);

      expect(resA.status).toBe(200);
      expect(resA.body.data.length).toBe(2);

      const resB = await request(app)
        .get('/api/v1/jobs')
        .set('Cookie', cookieB);

      expect(resB.status).toBe(200);
      expect(resB.body.data.length).toBe(1);
      expect(resB.body.data[0].companyName).toBe('Meta');
    });

    it('should prevent User B from reading User A\'s job (IDOR Protection)', async () => {
      const createRes = await request(app).post('/api/v1/jobs').set('Cookie', cookieA).send(jobPayload);
      const jobId = createRes.body.data._id;

      const res = await request(app)
        .get(`/api/v1/jobs/${jobId}`)
        .set('Cookie', cookieB);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/not found/i);
    });

    it('should update a job application', async () => {
      const createRes = await request(app).post('/api/v1/jobs').set('Cookie', cookieA).send(jobPayload);
      const jobId = createRes.body.data._id;

      const updateRes = await request(app)
        .put(`/api/v1/jobs/${jobId}`)
        .set('Cookie', cookieA)
        .send({ status: 'Interview' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.status).toBe('Interview');
    });

    it('should prevent User B from deleting User A\'s job', async () => {
      const createRes = await request(app).post('/api/v1/jobs').set('Cookie', cookieA).send(jobPayload);
      const jobId = createRes.body.data._id;

      const deleteRes = await request(app)
        .delete(`/api/v1/jobs/${jobId}`)
        .set('Cookie', cookieB);

      expect(deleteRes.status).toBe(404);
      
      const count = await JobApplication.countDocuments();
      expect(count).toBe(1); // Job was not deleted
    });

    it('should calculate job stats correctly', async () => {
      await request(app).post('/api/v1/jobs').set('Cookie', cookieA).send({ companyName: '1', jobTitle: 'A', status: 'Applied' });
      await request(app).post('/api/v1/jobs').set('Cookie', cookieA).send({ companyName: '2', jobTitle: 'B', status: 'Interview' });
      await request(app).post('/api/v1/jobs').set('Cookie', cookieA).send({ companyName: '3', jobTitle: 'C', status: 'Interview' });
      
      const res = await request(app)
        .get('/api/v1/jobs/stats')
        .set('Cookie', cookieA);

      expect(res.status).toBe(200);
      expect(res.body.data.Applied).toBe(1);
      expect(res.body.data.Interview).toBe(2);
      expect(res.body.data.Rejected).toBe(0);
    });
  });
});
