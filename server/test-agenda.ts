import { Agenda, Job } from 'agenda';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function run() {
  const agenda = new Agenda({ db: { address: process.env.MONGODB_URI as string, collection: 'agendaJobs' } });

  agenda.define('test-job', async (job: Job) => {
    console.log('Processing test job');
    // Simulate what the original code does
    await job.remove();
    console.log('Job removed from inside processor');
  });

  await agenda.start();
  console.log('Agenda started');

  await agenda.now('test-job', {});
  console.log('Job scheduled');

  // Wait a bit to observe logs
  setTimeout(() => {
    console.log('Done waiting');
    process.exit(0);
  }, 5000);
}

run().catch(console.error);
