import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import mongoose from 'mongoose';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const { agenda } = await import('./src/config/agenda.js');
  
  await agenda.start();
  
  agenda.define('test-quick-job', async (job) => {
    console.log('Running quick job...');
  });
  
  const future = new Date(Date.now() + 5000);
  console.log(`Scheduling for ${future.toISOString()}`);
  await agenda.schedule(future, 'test-quick-job', {});
  
  setTimeout(async () => {
    const db = mongoose.connection.db;
    const job = await db.collection('agendaJobs').findOne({ name: 'test-quick-job' });
    console.log('Job:', JSON.stringify(job, null, 2));
    process.exit(0);
  }, 10000);
}
run().catch(console.error);
