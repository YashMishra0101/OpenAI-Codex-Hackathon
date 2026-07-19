import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import mongoose from 'mongoose';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const { agenda } = await import('./src/config/agenda.js');
  
  await agenda.start();
  
  // Overwrite the definition to simulate failure
  agenda.define('send-interview-reminder', async (job) => {
    console.log('Running simulated failed job');
    throw new Error('Simulated Nodemailer timeout');
  });
  
  await agenda.now('send-interview-reminder', {
    to: 'test@example.com',
    companyName: 'Test',
    jobTitle: 'Test',
  });
  
  setTimeout(async () => {
    const db = mongoose.connection.db;
    const job = await db.collection('agendaJobs').findOne({ 
      name: 'send-interview-reminder',
      "data.to": 'test@example.com' 
    });
    console.log('failReason:', job.failReason);
    process.exit(0);
  }, 5000);
}
run().catch(console.error);
