import { Agenda } from 'agenda';
import { env } from './env.js';
import logger from '../utils/logger.js';
import { sendEmail } from './emailService.js';

export const agenda = new Agenda({
  db: { address: env.MONGODB_URI, collection: 'agendaJobs' },
});

// Define Jobs
agenda.define('send-interview-reminder', async (job: any) => {
  const { to, companyName, jobTitle, notes } = job.attrs.data as {
    to: string;
    companyName: string;
    jobTitle: string;
    notes?: string;
  };

  logger.info(`Processing reminder job for ${to} (${companyName})`);

  const html = `
    <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
      <h2>Interview Reminder</h2>
      <p>This is a reminder for your upcoming interview or follow-up with <strong>${companyName}</strong> for the <strong>${jobTitle}</strong> position.</p>
      ${notes ? `<p><strong>Your Notes:</strong><br/>${notes}</p>` : ''}
      <p>Good luck!</p>
    </div>
  `;

  await sendEmail({
    to,
    subject: `Reminder: Upcoming Interview with ${companyName}`,
    html,
  });
});

// Start Agenda
export async function startAgenda() {
  try {
    await agenda.start();
    logger.info('Agenda background job processor started successfully.');
  } catch (error) {
    logger.error('Failed to start Agenda', error);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  await agenda.stop();
  process.exit(0);
});
