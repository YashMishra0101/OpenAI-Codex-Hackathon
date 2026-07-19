import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from './src/config/env.js';

async function checkJob() {
  await mongoose.connect(env.MONGODB_URI);
  
  const db = mongoose.connection.db;
  const jobs = db.collection('jobapplications');
  const job = await jobs.findOne({ _id: new mongoose.Types.ObjectId('6a5d131ed7ca77524f2915bd') });
  
  console.log('Job found:', !!job);
  
  const agendaJobs = db.collection('agendaJobs');
  const deletedJob = await agendaJobs.findOne({ "data.jobId": "6a5d131ed7ca77524f2915bd" });
  console.log('Agenda Job data:', JSON.stringify(deletedJob, null, 2));
  
  await mongoose.disconnect();
}

checkJob().catch(console.error);
