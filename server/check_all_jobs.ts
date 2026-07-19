import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const db = mongoose.connection.db;
  
  const jobs = await db.collection('agendaJobs').find({}).toArray();
  for (const job of jobs) {
    console.log(`Job ID: ${job._id}, Name: ${job.name}, to: ${job.data?.to}, Scheduled for: ${job.nextRunAt}, lastRunAt: ${job.lastRunAt}, lastFinishedAt: ${job.lastFinishedAt}, failReason: ${job.failReason}`);
  }
  process.exit(0);
}
run().catch(console.error);
