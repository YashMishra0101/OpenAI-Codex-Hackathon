import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import logger from '../utils/logger.js';

/**
 * Email service using Nodemailer and Gmail.
 *
 * Uses a standard SMTP transport configured for Gmail.
 * To use this, you must supply your Gmail address (SMTP_USER) and a generated
 * 16-character App Password (SMTP_PASS) in the environment variables.
 *
 * The Nodemailer transporter is initialized lazily — if SMTP credentials are
 * missing, email sends will fail gracefully with a log warning instead of crashing.
 */

const APP_NAME = 'AI Resume Checker & Job Tracker';

let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!_transporter) {
    if (!env.SMTP_USER || !env.SMTP_PASS) {
      throw new Error('SMTP_USER and SMTP_PASS are not configured — email sending is disabled');
    }
    _transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }
  return _transporter;
}

function getFromAddress(): string {
  // Uses a formatted Display Name with the actual Gmail address
  return `"${APP_NAME}" <${env.SMTP_USER}>`;
}

// ── Email templates ──────────────────────────────────────────────────────────

function verificationEmailHtml(name: string, verificationUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your email — ${APP_NAME}</title>
</head>
<body style="background:#09090b;color:#fafafa;font-family:system-ui,sans-serif;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111113;border-radius:12px;border:1px solid #27272a;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center;">
          <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0;">${APP_NAME}</h1>
        </td></tr>
        <tr><td style="padding:40px 32px;">
          <h2 style="font-size:20px;font-weight:600;margin:0 0 12px;">Hi ${name},</h2>
          <p style="color:#a1a1aa;line-height:1.6;margin:0 0 24px;">
            Thanks for signing up! Please verify your email address to activate your account and access all features.
          </p>
          <a href="${verificationUrl}"
            style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;">
            Verify Email Address
          </a>
          <p style="color:#52525b;font-size:13px;margin:24px 0 0;">
            This link expires in <strong>24 hours</strong>. If you didn't create an account, you can safely ignore this email.
          </p>
          <p style="color:#3f3f46;font-size:12px;margin:16px 0 0;word-break:break-all;">
            Or paste this URL in your browser:<br/>
            <a href="${verificationUrl}" style="color:#6366f1;">${verificationUrl}</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function passwordResetEmailHtml(name: string, resetUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your password — ${APP_NAME}</title>
</head>
<body style="background:#09090b;color:#fafafa;font-family:system-ui,sans-serif;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111113;border-radius:12px;border:1px solid #27272a;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center;">
          <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0;">${APP_NAME}</h1>
        </td></tr>
        <tr><td style="padding:40px 32px;">
          <h2 style="font-size:20px;font-weight:600;margin:0 0 12px;">Hi ${name},</h2>
          <p style="color:#a1a1aa;line-height:1.6;margin:0 0 24px;">
            We received a request to reset your password. Click the button below to choose a new password.
            This link expires in <strong>1 hour</strong>.
          </p>
          <a href="${resetUrl}"
            style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;">
            Reset Password
          </a>
          <p style="color:#52525b;font-size:13px;margin:24px 0 0;">
            If you didn't request this, your account is safe — you can ignore this email.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Email sending functions ──────────────────────────────────────────────────

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string,
): Promise<void> {
  const verificationUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: getFromAddress(),
      to: email,
      subject: `Verify your email — ${APP_NAME}`,
      html: verificationEmailHtml(name, verificationUrl),
    });
    logger.info('EMAIL_VERIFICATION_SENT', { email });
  } catch (err) {
    logger.error('EMAIL_VERIFICATION_FAILED', {
      email,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string,
): Promise<void> {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: getFromAddress(),
      to: email,
      subject: `Reset your password — ${APP_NAME}`,
      html: passwordResetEmailHtml(name, resetUrl),
    });
    logger.info('EMAIL_RESET_SENT', { email });
  } catch (err) {
    logger.error('EMAIL_RESET_FAILED', {
      email,
      error: err instanceof Error ? err.message : String(err),
    });
    // For password reset, surface the failure — user needs to know the email didn't send
    throw err;
  }
}
