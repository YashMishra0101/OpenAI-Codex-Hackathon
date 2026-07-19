import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import mongoose from 'mongoose';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const db = mongoose.connection.db;
  
  const jobs = await db.collection('agendaJobs').find({ "data.jobId": "6a5d0eadaf4778351961bc33" }).toArray();
  console.log(`Found ${jobs.length} jobs for 6a5d0eadaf4778351961bc33`);
  for (const job of jobs) {
    console.log(`Job: ${job.name}, lastRunAt: ${job.lastRunAt}, lastFinishedAt: ${job.lastFinishedAt}`);
  }
  
  process.exit(0);
}
run().catch(console.error);
