import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import mongoose from 'mongoose';
import { Agenda } from 'agenda';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const agenda = new Agenda({ db: { address: process.env.MONGODB_URI as string, collection: 'agendaJobs' } });
  
  agenda.define('test-fail-job', async (job) => {
    console.log('Job running, throwing error');
    throw new Error('Test error');
  });
  
  await agenda.start();
  
  await agenda.now('test-fail-job', {});
  
  setTimeout(async () => {
    const db = mongoose.connection.db;
    const job = await db.collection('agendaJobs').findOne({ name: 'test-fail-job' });
    console.log('failReason:', job.failReason);
    console.log('failedAt:', job.failedAt);
    process.exit(0);
  }, 3000);
}
run().catch(console.error);
