import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import mongoose from 'mongoose';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const { agenda } = await import('./src/config/agenda.js');
  
  await agenda.start();
  
  // Overwrite the definition to simulate failure
  agenda.define('test-fail-job', async (job) => {
    throw new Error('Simulated error');
  });
  
  await agenda.now('test-fail-job', {
    to: 'test2@example.com',
  });
  
  setTimeout(async () => {
    const db = mongoose.connection.db;
    const job = await db.collection('agendaJobs').findOne({ 
      name: 'test-fail-job',
    });
    console.log('Job:', JSON.stringify(job, null, 2));
    process.exit(0);
  }, 5000);
}
run().catch(console.error);
