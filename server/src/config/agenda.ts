import { Agenda, Job } from 'agenda';
import { env } from './env.js';
import logger from '../utils/logger.js';
import { sendReminderEmail } from '../services/emailService.js';
import { JobApplication } from '../models/JobApplication.js';

export const agenda = new Agenda({
  db: { address: env.MONGODB_URI, collection: 'agendaJobs' },
});

// ── Job definitions ───────────────────────────────────────────────────────────

/**
 * send-interview-reminder
 *
 * One-shot Agenda job that fires at the user-scheduled time and sends
 * a reminder email for an upcoming interview or follow-up.
 *
 * Error handling contract:
 *   - sendReminderEmail throws on SMTP failure (unlike the old config/emailService
 *     sendEmail which returned false and was silently swallowed).
 *   - If this handler throws, Agenda marks the job as failed — failures are
 *     visible in logs / monitoring and the job document is preserved in MongoDB
 *     for investigation rather than being quietly discarded.
 *   - On success, job.remove() cleans up the one-shot document so completed
 *     reminders do not accumulate in the agendaJobs collection.
 */
agenda.define(
  'send-interview-reminder-v2',
  async (
    job: Job<{
      to: string;
      companyName: string;
      jobTitle: string;
      notes?: string;
      jobId?: string;
    }>,
  ) => {
    const { to, companyName, jobTitle, notes, jobId } = job.attrs.data as {
      to: string;
      companyName: string;
      jobTitle: string;
      notes?: string;
      jobId?: string;
    };

    logger.info('REMINDER_JOB_PROCESSING', { to, companyName, jobId });

    // sendReminderEmail throws on failure — any SMTP error propagates here,
    // causing Agenda to mark this job as failed so it can be investigated.
    await sendReminderEmail(to, companyName, jobTitle, notes);

    // Decrement reminderCount BEFORE removing the job document.
    // If the decrement throws (transient MongoDB error), the job document is
    // still in agendaJobs so Agenda can retry the handler on the next cycle.
    // Wrapping in try/catch ensures a decrement failure is logged but does not
    // re-send the email — the email was already delivered successfully.
    if (jobId) {
      try {
        await JobApplication.findByIdAndUpdate(jobId, {
          $inc: { reminderCount: -1 },
        });
        
        // Ensure reminder count never goes below 0 (safeguard)
        await JobApplication.updateOne(
          { _id: jobId, reminderCount: { $lt: 0 } },
          { $set: { reminderCount: 0 } }
        );
        
        logger.info('REMINDER_COUNT_DECREMENTED', { jobId });
      } catch (decrementErr) {
        logger.error('REMINDER_COUNT_DECREMENT_FAILED', {
          jobId,
          error: decrementErr instanceof Error ? decrementErr.message : String(decrementErr),
        });
      }
    }

    // DO NOT use `await job.remove()` here!
    // Agenda v5 automatically sets `nextRunAt: null` for one-off jobs upon successful completion.
    // Calling job.remove() manually inside the handler causes a race condition where Agenda's
    // internal finally block re-inserts the removed job.
    
    logger.info('REMINDER_EMAIL_SENT_AND_CLEANED', { to, jobId });
  },
);

// ── Lifecycle ─────────────────────────────────────────────────────────────────

export async function startAgenda(): Promise<void> {
  try {
    await agenda.start();
    logger.info('Agenda background job processor started successfully.');
  } catch (error) {
    logger.error('Failed to start Agenda', error);
  }
}

// Graceful shutdown — give Agenda time to finish any in-flight jobs before exit.
process.on('SIGTERM', () => {
  void agenda.stop().then(() => {
    process.exit(0);
  });
});
