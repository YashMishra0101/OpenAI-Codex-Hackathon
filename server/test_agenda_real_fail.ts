import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { agenda } from './src/config/agenda.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  await agenda.start();
  
  // Schedule the real job
  await agenda.now('send-interview-reminder', {
    to: 'throw@example.com',
    companyName: 'Test Company',
    jobTitle: 'Test Job',
    jobId: '6a5d0eadaf4778351961bc33'
  });
  
  // Wait 10 seconds for it to run and fail (we need it to fail to test)
  // Wait, the REAL sendReminderEmail won't fail! We need to make it fail!
  // I will just schedule it, and since 'throw@example.com' is invalid?
  // No, Nodemailer will accept it and try to send it.
  
  console.log('Job scheduled. Exiting.');
  process.exit(0);
}
run().catch(console.error);
