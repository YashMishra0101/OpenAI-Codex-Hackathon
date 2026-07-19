import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import mongoose from 'mongoose';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const { agenda } = await import('./src/config/agenda.js');
  
  await agenda.start();
  
  agenda.define('test-hang-job', async (job) => {
    console.log('Running hanging job...');
    await new Promise(resolve => setTimeout(resolve, 60000)); // hang for 1 min
    console.log('Hanging job finished');
  });
  
  await agenda.now('test-hang-job', {});
  
  setTimeout(async () => {
    console.log('Stopping agenda...');
    await agenda.stop();
    
    const db = mongoose.connection.db;
    const job = await db.collection('agendaJobs').findOne({ name: 'test-hang-job' });
    console.log('Job:', JSON.stringify(job, null, 2));
    process.exit(0);
  }, 2000); // Stop agenda after 2 seconds
}
run().catch(console.error);
