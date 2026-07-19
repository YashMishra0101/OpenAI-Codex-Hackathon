import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { agenda } from './src/config/agenda.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  await agenda.start();
  
  agenda.define('test-remove-job', async (job) => {
    console.log('Job running, removing...');
    await job.remove();
    console.log('Job removed from DB inside handler.');
  });
  
  await agenda.now('test-remove-job', {});
  
  setTimeout(async () => {
    const db = mongoose.connection.db;
    const job = await db.collection('agendaJobs').findOne({ name: 'test-remove-job' });
    console.log('Job after execution:', job ? 'EXISTS' : 'DELETED');
    if (job) {
      console.log('lastFinishedAt:', job.lastFinishedAt);
      console.log('nextRunAt:', job.nextRunAt);
    }
    process.exit(0);
  }, 3000);
}
run().catch(console.error);
