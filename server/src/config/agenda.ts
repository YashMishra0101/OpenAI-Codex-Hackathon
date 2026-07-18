import { Agenda } from 'agenda';
import { env } from './env.js';
import logger from '../utils/logger.js';
import { sendEmail } from './emailService.js';

export const agenda = new Agenda({
  db: { address: env.MONGODB_URI, collection: 'agendaJobs' },
});

/**
 * Escapes HTML special characters to prevent HTML injection in email templates.
 * User-supplied values (companyName, jobTitle, notes) are untrusted and must
 * be escaped before insertion into HTML strings.
 */
function htmlEscape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// Define Jobs
agenda.define('send-interview-reminder', async (job: any) => {
  const { to, companyName, jobTitle, notes, jobId } = job.attrs.data as {
    to: string;
    companyName: string;
    jobTitle: string;
    notes?: string;
    jobId?: string;
  };

  logger.info(`Processing reminder job for ${to} (${companyName})`);

  // Escape all user-supplied values before embedding in HTML
  const safeCompany = htmlEscape(companyName);
  const safeTitle = htmlEscape(jobTitle);
  const safeNotes = notes ? htmlEscape(notes) : null;

  const html = `
    <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
      <h2>Interview Reminder</h2>
      <p>This is a reminder for your upcoming interview or follow-up with <strong>${safeCompany}</strong> for the <strong>${safeTitle}</strong> position.</p>
      ${safeNotes ? `<p><strong>Your Notes:</strong><br/>${safeNotes}</p>` : ''}
      <p>Good luck!</p>
    </div>
  `;

  const sent = await sendEmail({
    to,
    subject: `Reminder: Upcoming Interview with ${safeCompany}`,
    html,
  });

  if (sent) {
    // Remove the Agenda job document — reminder is a one-shot, not recurring
    await job.remove();
    logger.info('REMINDER_EMAIL_SENT_AND_CLEANED', { to, jobId });

    // Decrement reminderCount on the JobApplication if we have a jobId
    if (jobId) {
      const { JobApplication } = await import('../models/JobApplication.js');
      await JobApplication.findByIdAndUpdate(jobId, { $inc: { reminderCount: -1 } });
    }
  } else {
    logger.error('REMINDER_EMAIL_FAILED', { to, jobId });
    // Do NOT remove — Agenda will retry on the next run
  }
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
