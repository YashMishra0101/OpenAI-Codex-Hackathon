import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';
import { env } from './env.js';

let transporter: nodemailer.Transporter | null = null;

if (env.SMTP_USER && env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
  logger.info('Nodemailer Email Service initialized.');
} else {
  logger.warn('SMTP credentials missing. Email delivery will be mocked in the console.');
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
    if (transporter) {
      const info = await transporter.sendMail({
        from: `"AI Resume Checker & Job Tracker" <${env.SMTP_USER}>`,
        to,
        subject,
        html,
      });

      logger.info(`Email sent to ${to} (Message-ID: ${info.messageId})`);
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
