import { Resend } from 'resend';
import logger from '../utils/logger.js';
import { env } from './env.js';

let resend: Resend | null = null;

if (env.RESEND_API_KEY) {
  resend = new Resend(env.RESEND_API_KEY);
  logger.info('Resend Email Service initialized.');
} else {
  logger.warn('RESEND_API_KEY is missing. Email delivery will be mocked in the console.');
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  try {
    if (resend) {
      const data = await resend.emails.send({
        from: 'Job Tracker <onboarding@resend.dev>', // Resend sandbox default testing email
        to,
        subject,
        html,
      });

      if (data.error) {
        logger.error('Failed to send email via Resend', data.error);
        return false;
      }

      logger.info(`Email sent to ${to} (ID: ${data.data?.id})`);
      return true;
    } else {
      // MOCK MODE
      logger.info('--- MOCKED EMAIL DELIVERED ---');
      logger.info(`To: ${to}`);
      logger.info(`Subject: ${subject}`);
      logger.info(`Content: ${html}`);
      logger.info('------------------------------');
      return true;
    }
  } catch (error) {
    logger.error('Error sending email', error);
    return false;
  }
}
