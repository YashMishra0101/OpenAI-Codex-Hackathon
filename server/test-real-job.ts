import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import mongoose from 'mongoose';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected to DB');

  // Import agenda dynamically AFTER dotenv is loaded
  const { agenda } = await import('./src/config/agenda.js');

  await agenda.start();
  console.log('Agenda started');

  const now = new Date();
  const scheduledDate = new Date(now.getTime() + 2000); // 2 seconds from now

  await agenda.schedule(scheduledDate, 'send-interview-reminder', {
    to: 'test@example.com',
    companyName: 'Test Inc',
    jobTitle: 'Software Engineer',
    notes: 'Test note',
    jobId: new mongoose.Types.ObjectId().toString(),
  });
  console.log('Job scheduled for 2 seconds from now');

  setTimeout(() => {
    console.log('Exiting after 5 seconds');
    process.exit(0);
  }, 5000);
}

run().catch(console.error);
