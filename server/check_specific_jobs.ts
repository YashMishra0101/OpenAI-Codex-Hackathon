import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const db = mongoose.connection.db;
  
  const jobs = await db.collection('agendaJobs').find({ name: 'send-interview-reminder' }).toArray();
  for (const job of jobs) {
    if (job._id.toString() === '6a5d29aee512ce99862a27b8' || job._id.toString() === '6a5d29f9e512ce99862a27b9') {
      console.log(`Job ID: ${job._id}, Data: ${JSON.stringify(job.data)}`);
    }
  }
  process.exit(0);
}
run().catch(console.error);
