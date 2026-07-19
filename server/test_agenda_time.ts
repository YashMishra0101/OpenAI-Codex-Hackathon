import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import mongoose from 'mongoose';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const { agenda } = await import('./src/config/agenda.js');
  
  agenda.define('test-time-job', async (job) => {
    console.log('Job running at', new Date());
  });
  
  await agenda.start();
  
  const pastDate = new Date(Date.now() - 60000); // 1 minute ago
  await agenda.schedule(pastDate, 'test-time-job', {});
  
  setTimeout(async () => {
    const db = mongoose.connection.db;
    const job = await db.collection('agendaJobs').findOne({ name: 'test-time-job' });
    console.log('lastRunAt:', job.lastRunAt);
    console.log('lastFinishedAt:', job.lastFinishedAt);
    process.exit(0);
  }, 3000);
}
run().catch(console.error);
