import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { JobApplication } from './src/models/JobApplication.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  
  const idStr = '6a5d0eadaf4778351961bc33';
  try {
    const res = await JobApplication.findByIdAndUpdate(idStr, {
      $inc: { reminderCount: -1 },
    });
    console.log('Update result:', !!res);
  } catch (err: any) {
    console.log('Error:', err.message);
  }
  
  const doc = await JobApplication.findById(idStr);
  console.log('Counter:', doc?.reminderCount);
  
  process.exit(0);
}
run().catch(console.error);
