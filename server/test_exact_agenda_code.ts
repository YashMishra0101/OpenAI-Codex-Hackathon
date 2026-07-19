import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { JobApplication } from './src/models/JobApplication.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  
  const jobId = '6a5d0eadaf4778351961bc33';
  
  console.log('Before update:', (await JobApplication.findById(jobId))?.reminderCount);
  
  // The exact code from agenda.ts
  if (jobId) {
    try {
      await JobApplication.findByIdAndUpdate(jobId, {
        $inc: { reminderCount: -1 },
      });
      console.log('REMINDER_COUNT_DECREMENTED', { jobId });
    } catch (decrementErr: any) {
      console.error('REMINDER_COUNT_DECREMENT_FAILED', {
        jobId,
        error: decrementErr.message,
      });
    }
  }
  
  console.log('After update:', (await JobApplication.findById(jobId))?.reminderCount);
  
  process.exit(0);
}
run().catch(console.error);
