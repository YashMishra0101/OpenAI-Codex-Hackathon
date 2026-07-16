import mongoose from 'mongoose';
import 'dotenv/config'; // Load .env
import { env } from '../config/env.js';
import User from '../models/User.js';
import Resume from '../models/Resume.js';
import JobApplication from '../models/JobApplication.js';
import logger from '../utils/logger.js';
import argon2 from 'argon2';

const SEED_USER_EMAIL = 'admin@example.com';
const SEED_USER_PASSWORD = 'Password123!';

async function seedDatabase() {
  try {
    logger.info('Connecting to database...');
    await mongoose.connect(env.MONGODB_URI);
    logger.info('Connected.');

    logger.info('Clearing existing data...');
    await User.deleteMany({ email: SEED_USER_EMAIL });
    // Note: We don't delete all users to avoid destroying dev data, 
    // but we'll delete the seed user's jobs and resumes
    
    // 1. Create Seed User
    const hashedPassword = await argon2.hash(SEED_USER_PASSWORD);
    const user = await User.create({
      name: 'Demo Admin',
      email: SEED_USER_EMAIL,
      password: hashedPassword,
      isVerified: true,
    });

    // Clear old seed data for this user
    await Resume.deleteMany({ userId: user._id });
    await JobApplication.deleteMany({ userId: user._id });

    // 2. Seed Resumes (Analyses)
    logger.info('Seeding Resumes...');
    await Resume.create([
      {
        userId: user._id,
        filename: 'frontend_engineer_resume.pdf',
        fileUrl: 'https://example.com/resume1.pdf',
        aiAnalysis: {
          overallVerdict: 'Strong Match',
          analysis: 'Excellent React and TypeScript experience. Strong component architecture skills.',
          improvementSuggestions: ['Add more measurable metrics (e.g., improved performance by X%)'],
          interviewQuestions: [
            'Can you explain React Server Components?',
            'How do you manage complex state in a large application?'
          ],
          advancedSearchQueries: ['Frontend Engineer AND "React" AND "TypeScript"'],
        }
      },
      {
        userId: user._id,
        filename: 'fullstack_resume.pdf',
        fileUrl: 'https://example.com/resume2.pdf',
        aiAnalysis: {
          overallVerdict: 'Partial Match',
          analysis: 'Good Node.js experience, but lacks heavy frontend state management examples.',
          improvementSuggestions: ['Highlight your frontend work more prominently.'],
          interviewQuestions: ['How would you scale a Node.js backend?'],
          advancedSearchQueries: ['Full Stack Engineer AND "Node.js" AND "React"'],
        }
      }
    ]);

    // 3. Seed Job Applications
    logger.info('Seeding Job Applications...');
    const jobs = [
      { companyName: 'Google', jobTitle: 'Senior Frontend Engineer', status: 'Offer', location: 'Mountain View, CA', salary: '$200k', url: 'https://careers.google.com' },
      { companyName: 'Meta', jobTitle: 'React Engineer', status: 'Interview', location: 'Menlo Park, CA', salary: '$180k' },
      { companyName: 'Netflix', jobTitle: 'UI Engineer', status: 'Applied', location: 'Los Gatos, CA' },
      { companyName: 'Amazon', jobTitle: 'SDE II', status: 'Rejected', location: 'Seattle, WA' },
      { companyName: 'Stripe', jobTitle: 'Frontend Developer', status: 'Saved', location: 'Remote' },
      { companyName: 'Vercel', jobTitle: 'Software Engineer', status: 'Interview', location: 'Remote', salary: '$160k' },
      { companyName: 'OpenAI', jobTitle: 'Member of Technical Staff', status: 'Applied', location: 'San Francisco, CA' },
    ];

    await JobApplication.insertMany(
      jobs.map(job => ({ ...job, userId: user._id }))
    );

    logger.info('✅ Database seeded successfully!');
    logger.info('-----------------------------------');
    logger.info(`Test Email: ${SEED_USER_EMAIL}`);
    logger.info(`Test Password: ${SEED_USER_PASSWORD}`);
    logger.info('-----------------------------------');

    process.exit(0);
  } catch (error) {
    logger.error('Failed to seed database:', error);
    process.exit(1);
  }
}

seedDatabase();
