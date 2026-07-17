import mongoose from 'mongoose';
import 'dotenv/config'; // Load .env
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Resume } from '../models/Resume.js';
import { JobApplication } from '../models/JobApplication.js';
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
    await Resume.deleteMany({ user: user._id });
    await JobApplication.deleteMany({ user: user._id });

    // 2. Seed Resumes (Analyses)
    logger.info('Seeding Resumes...');
    await Resume.create([
      {
        user: user._id,
        resumeText: 'Frontend engineer with 5 years of React experience. Building fast SPAs.',
        verdict: 'Strong',
        analysis: {
          strengths: ['Excellent React and TypeScript experience', 'Strong component architecture skills'],
          improvements: ['Add more measurable metrics (e.g., improved performance by X%)']
        },
        interviewQuestions: [
          'Can you explain React Server Components?',
          'How do you manage complex state in a large application?'
        ],
        searchQueries: [{ query: 'Frontend Engineer AND "React" AND "TypeScript"', category: 'job' }],
      },
      {
        user: user._id,
        resumeText: 'Fullstack developer with Node.js and basic frontend knowledge.',
        verdict: 'Partial',
        analysis: {
          strengths: ['Good Node.js experience'],
          improvements: ['Highlight your frontend work more prominently', 'Add state management examples']
        },
        interviewQuestions: ['How would you scale a Node.js backend?'],
        searchQueries: [{ query: 'Full Stack Engineer AND "Node.js" AND "React"', category: 'job' }],
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
      jobs.map(job => ({ ...job, user: user._id }))
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
