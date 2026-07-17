import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { User } from '../../models/User.js';
import { JobApplication } from '../../models/JobApplication.js';

vi.mock('../../config/emailService.js', () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
}));
vi.mock('../../config/agenda.js', () => ({
  agenda: { schedule: vi.fn() },
}));

describe('Job API Integration Tests', () => {
  const testUserA = { name: 'User A', email: 'usera@example.com', password: 'Password123!' };
  const testUserB = { name: 'User B', email: 'userb@example.com', password: 'Password123!' };

  let tokenA: string;
  let tokenB: string;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Register and Verify User A
    await request(app).post('/api/v1/auth/register').send(testUserA);
    await User.updateOne({ email: testUserA.email }, { isVerified: true });
    const loginA = await request(app).post('/api/v1/auth/login').send({ email: testUserA.email, password: testUserA.password });
    tokenA = loginA.body.data.accessToken;

    // Register and Verify User B
    await request(app).post('/api/v1/auth/register').send(testUserB);
    await User.updateOne({ email: testUserB.email }, { isVerified: true });
    const loginB = await request(app).post('/api/v1/auth/login').send({ email: testUserB.email, password: testUserB.password });
    tokenB = loginB.body.data.accessToken;
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
        .set('Authorization', `Bearer ${tokenA}`)
        .send(jobPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.companyName).toBe(jobPayload.companyName);
      
      const count = await JobApplication.countDocuments();
      expect(count).toBe(1);
    });

    it('should list all jobs for the authenticated user', async () => {
      await request(app).post('/api/v1/jobs').set('Authorization', `Bearer ${tokenA}`).send(jobPayload);
      await request(app).post('/api/v1/jobs').set('Authorization', `Bearer ${tokenA}`).send({ ...jobPayload, companyName: 'Apple' });
      await request(app).post('/api/v1/jobs').set('Authorization', `Bearer ${tokenB}`).send({ ...jobPayload, companyName: 'Meta' });

      const resA = await request(app)
        .get('/api/v1/jobs')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(resA.status).toBe(200);
      expect(resA.body.data.length).toBe(2);

      const resB = await request(app)
        .get('/api/v1/jobs')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(resB.status).toBe(200);
      expect(resB.body.data.length).toBe(1);
      expect(resB.body.data[0].companyName).toBe('Meta');
    });

    it('should prevent User B from reading User A\'s job (IDOR Protection)', async () => {
      const createRes = await request(app).post('/api/v1/jobs').set('Authorization', `Bearer ${tokenA}`).send(jobPayload);
      const jobId = createRes.body.data._id;

      const res = await request(app)
        .get(`/api/v1/jobs/${jobId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/not found/i);
    });

    it('should update a job application', async () => {
      const createRes = await request(app).post('/api/v1/jobs').set('Authorization', `Bearer ${tokenA}`).send(jobPayload);
      const jobId = createRes.body.data._id;

      const updateRes = await request(app)
        .put(`/api/v1/jobs/${jobId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ status: 'Interview' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.status).toBe('Interview');
    });

    it('should prevent User B from deleting User A\'s job', async () => {
      const createRes = await request(app).post('/api/v1/jobs').set('Authorization', `Bearer ${tokenA}`).send(jobPayload);
      const jobId = createRes.body.data._id;

      const deleteRes = await request(app)
        .delete(`/api/v1/jobs/${jobId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(deleteRes.status).toBe(404);
      
      const count = await JobApplication.countDocuments();
      expect(count).toBe(1); // Job was not deleted
    });

    it('should calculate job stats correctly', async () => {
      await request(app).post('/api/v1/jobs').set('Authorization', `Bearer ${tokenA}`).send({ companyName: '1', jobTitle: 'A', status: 'Applied' });
      await request(app).post('/api/v1/jobs').set('Authorization', `Bearer ${tokenA}`).send({ companyName: '2', jobTitle: 'B', status: 'Interview' });
      await request(app).post('/api/v1/jobs').set('Authorization', `Bearer ${tokenA}`).send({ companyName: '3', jobTitle: 'C', status: 'Interview' });
      
      const res = await request(app)
        .get('/api/v1/jobs/stats')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.Applied).toBe(1);
      expect(res.body.data.Interview).toBe(2);
      expect(res.body.data.Rejected).toBe(0);
    });
  });
});
