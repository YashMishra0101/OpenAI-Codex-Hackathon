import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const db = mongoose.connection.db;
  
  const apps = await db.collection('jobapplications').find({}).toArray();
  for (const app of apps) {
    console.log(`App ID: ${app._id}, Company: ${app.companyName}, reminderCount: ${app.reminderCount}`);
  }
  process.exit(0);
}
run().catch(console.error);
