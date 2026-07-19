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

// ── Design tokens (hex equivalents of the app's HSL design system) ────────────
// Background:  hsl(160 10%  6%) → #0d1211
// Surface:     hsl(160 10%  8%) → #111714
// Border:      hsl(160 10% 16%) → #202b26
// Primary:     hsl(160 84% 39%) → #0fb872  (CodexAI emerald)
// Foreground:  hsl(0   0% 98%)  → #fafafa
// Muted:       hsl(160 10% 60%) → #86a396
// Dimmed:      hsl(160 10% 35%) → #445e52

const COLORS = {
  bg:          '#0d1211',
  surface:     '#111714',
  surfaceRaised:'#16201c',
  border:      '#202b26',
  borderLight: '#2a3b33',
  primary:     '#0fb872',
  primaryDark: '#0a9059',
  foreground:  '#fafafa',
  muted:       '#86a396',
  dimmed:      '#445e52',
  dimmedLight: '#5e8070',
} as const;

const APP_NAME = 'CodexAI';
const APP_TAGLINE = 'AI-powered Resume Analyzer & Job Tracker';
const SUPPORT_EMAIL = env.SMTP_USER ?? 'support@codexai.com';

let _transporter: nodemailer.Transporter | null = null;

/**
 * Returns a configured Nodemailer transport, or null if SMTP credentials
 * are not set. When null is returned, callers fall back to console-logging
 * the email (mock mode — useful for local development without email setup).
 */
function getTransporter(): nodemailer.Transporter | null {
  if (_transporter) return _transporter;

  if (!env.SMTP_USER || !env.SMTP_PASS) {
    return null; // Mock mode — no credentials configured
  }

  _transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
  return _transporter;
}

function getFromAddress(): string {
  return `"${APP_NAME}" <${env.SMTP_USER}>`;
}

// ── Shared layout wrappers ────────────────────────────────────────────────────

function emailWrapper(bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${COLORS.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${COLORS.bg};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <!-- Email card: max 580px -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;width:100%;">

          <!-- ── Logo / Header ── -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:${COLORS.primary};width:36px;height:36px;border-radius:8px;text-align:center;vertical-align:middle;">
                    <span style="color:#ffffff;font-size:18px;font-weight:700;line-height:36px;display:block;">C</span>
                  </td>
                  <td style="padding-left:10px;vertical-align:middle;">
                    <span style="color:${COLORS.foreground};font-size:20px;font-weight:700;letter-spacing:-0.3px;">Codex<span style="color:${COLORS.primary};">AI</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Card ── -->
          <tr>
            <td style="background-color:${COLORS.surface};border:1px solid ${COLORS.border};border-radius:16px;overflow:hidden;">

              <!-- Card top accent line -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="height:3px;background-color:${COLORS.primary};border-radius:16px 16px 0 0;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>

              <!-- Card body -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:40px 40px 36px;">
                    ${bodyContent}
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td style="padding-top:28px;">
              <!-- Security notice -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:${COLORS.surfaceRaised};border:1px solid ${COLORS.border};border-radius:10px;padding:14px 18px;">
                    <p style="margin:0;color:${COLORS.dimmedLight};font-size:12px;line-height:1.5;text-align:center;">
                      🔒&nbsp; For your security, never share this email or its links with anyone.<br/>
                      ${APP_NAME} will never ask for your password via email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Copyright ── -->
          <tr>
            <td style="padding-top:20px;text-align:center;">
              <p style="margin:0 0 4px;color:${COLORS.dimmed};font-size:12px;">
                Need help? Email us at
                <a href="mailto:${SUPPORT_EMAIL}" style="color:${COLORS.primary};text-decoration:none;">${SUPPORT_EMAIL}</a>
              </p>
              <p style="margin:0;color:${COLORS.dimmed};font-size:11px;">
                &copy; ${new Date().getFullYear()} ${APP_NAME} &mdash; ${APP_TAGLINE}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Email templates ────────────────────────────────────────────────────────────

function verificationEmailHtml(name: string, verificationUrl: string): string {
  const firstName = name.split(' ')[0] ?? name;

  const body = `
    <!-- Icon -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="width:64px;height:64px;background-color:rgba(15,184,114,0.12);border:1px solid rgba(15,184,114,0.25);border-radius:14px;text-align:center;vertical-align:middle;">
                <!-- Envelope checkmark symbol -->
                <span style="font-size:28px;line-height:64px;display:block;">✉️</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Heading -->
    <h1 style="margin:0 0 8px;color:${COLORS.foreground};font-size:24px;font-weight:700;text-align:center;letter-spacing:-0.4px;line-height:1.2;">
      Verify your email address
    </h1>
    <p style="margin:0 0 32px;color:${COLORS.muted};font-size:14px;text-align:center;line-height:1.5;">
      One quick step to activate your ${APP_NAME} account
    </p>

    <!-- Divider -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr><td style="height:1px;background-color:${COLORS.border};font-size:0;line-height:0;">&nbsp;</td></tr>
    </table>

    <!-- Greeting -->
    <p style="margin:0 0 16px;color:${COLORS.foreground};font-size:16px;font-weight:600;">
      Hi ${firstName},
    </p>
    <p style="margin:0 0 12px;color:${COLORS.muted};font-size:14px;line-height:1.65;">
      Welcome to ${APP_NAME}! We're excited to have you on board.
    </p>
    <p style="margin:0 0 32px;color:${COLORS.muted};font-size:14px;line-height:1.65;">
      To complete your registration and unlock AI-powered resume analysis and job tracking, please verify your email address by clicking the button below.
    </p>

    <!-- CTA Button -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background-color:${COLORS.primary};border-radius:10px;">
                <a href="${verificationUrl}"
                   target="_blank"
                   rel="noopener noreferrer"
                   style="display:inline-block;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;letter-spacing:0.1px;padding:14px 36px;border-radius:10px;">
                  Verify Email Address &rarr;
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Expiry notice -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td style="background-color:${COLORS.surfaceRaised};border:1px solid ${COLORS.border};border-radius:10px;padding:14px 18px;">
          <p style="margin:0;color:${COLORS.muted};font-size:13px;line-height:1.5;">
            ⏱️&nbsp; This link expires in <strong style="color:${COLORS.foreground};">24 hours</strong>.
            After that, you'll need to request a new verification email from the sign-in page.
          </p>
        </td>
      </tr>
    </table>

    <!-- Divider -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
      <tr><td style="height:1px;background-color:${COLORS.border};font-size:0;line-height:0;">&nbsp;</td></tr>
    </table>

    <!-- Fallback URL -->
    <p style="margin:0 0 8px;color:${COLORS.dimmedLight};font-size:12px;line-height:1.5;">
      Button not working? Copy and paste this link into your browser:
    </p>
    <p style="margin:0 0 24px;font-size:11px;line-height:1.5;word-break:break-all;">
      <a href="${verificationUrl}" style="color:${COLORS.primary};text-decoration:none;">${verificationUrl}</a>
    </p>

    <!-- Ignore notice -->
    <p style="margin:0;color:${COLORS.dimmed};font-size:12px;line-height:1.5;">
      Didn't create a ${APP_NAME} account? You can safely ignore this email — no action is required and your email will not be added to any list.
    </p>
  `;

  return emailWrapper(body);
}

function passwordResetEmailHtml(name: string, resetUrl: string): string {
  const firstName = name.split(' ')[0] ?? name;

  const body = `
    <!-- Icon -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="width:64px;height:64px;background-color:rgba(15,184,114,0.12);border:1px solid rgba(15,184,114,0.25);border-radius:14px;text-align:center;vertical-align:middle;">
                <span style="font-size:28px;line-height:64px;display:block;">🔑</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Heading -->
    <h1 style="margin:0 0 8px;color:${COLORS.foreground};font-size:24px;font-weight:700;text-align:center;letter-spacing:-0.4px;line-height:1.2;">
      Reset your password
    </h1>
    <p style="margin:0 0 32px;color:${COLORS.muted};font-size:14px;text-align:center;line-height:1.5;">
      A password reset was requested for your ${APP_NAME} account
    </p>

    <!-- Divider -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr><td style="height:1px;background-color:${COLORS.border};font-size:0;line-height:0;">&nbsp;</td></tr>
    </table>

    <!-- Greeting -->
    <p style="margin:0 0 16px;color:${COLORS.foreground};font-size:16px;font-weight:600;">
      Hi ${firstName},
    </p>
    <p style="margin:0 0 12px;color:${COLORS.muted};font-size:14px;line-height:1.65;">
      We received a request to reset the password for your ${APP_NAME} account.
    </p>
    <p style="margin:0 0 32px;color:${COLORS.muted};font-size:14px;line-height:1.65;">
      Click the button below to choose a new password. If you didn't make this request, you can safely ignore this email — your account remains secure.
    </p>

    <!-- CTA Button -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background-color:${COLORS.primary};border-radius:10px;">
                <a href="${resetUrl}"
                   target="_blank"
                   rel="noopener noreferrer"
                   style="display:inline-block;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;letter-spacing:0.1px;padding:14px 36px;border-radius:10px;">
                  Reset Password &rarr;
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Expiry notice -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td style="background-color:${COLORS.surfaceRaised};border:1px solid ${COLORS.border};border-radius:10px;padding:14px 18px;">
          <p style="margin:0;color:${COLORS.muted};font-size:13px;line-height:1.5;">
            ⏱️&nbsp; This reset link expires in <strong style="color:${COLORS.foreground};">1 hour</strong>.
            After that, you'll need to request a new reset link from the login page.
          </p>
        </td>
      </tr>
    </table>

    <!-- Divider -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
      <tr><td style="height:1px;background-color:${COLORS.border};font-size:0;line-height:0;">&nbsp;</td></tr>
    </table>

    <!-- Fallback URL -->
    <p style="margin:0 0 8px;color:${COLORS.dimmedLight};font-size:12px;line-height:1.5;">
      Button not working? Copy and paste this link into your browser:
    </p>
    <p style="margin:0 0 24px;font-size:11px;line-height:1.5;word-break:break-all;">
      <a href="${resetUrl}" style="color:${COLORS.primary};text-decoration:none;">${resetUrl}</a>
    </p>

    <!-- Ignore notice -->
    <p style="margin:0;color:${COLORS.dimmed};font-size:12px;line-height:1.5;">
      Didn't request a password reset? No worries — your account is safe. Simply ignore this email and your password will remain unchanged.
    </p>
  `;

  return emailWrapper(body);
}

// ── Email sending functions ────────────────────────────────────────────────────

async function dispatchEmail({
  to,
  subject,
  html,
  logKey,
}: {
  to: string;
  subject: string;
  html: string;
  logKey: string;
}): Promise<void> {
  const transporter = getTransporter();

  if (!transporter) {
    // Mock mode: no SMTP credentials — log to console for local dev visibility
    logger.warn(`[MOCK EMAIL] ${logKey}`, {
      to,
      subject,
      note: 'Set SMTP_USER and SMTP_PASS in .env to send real emails.',
    });
    logger.info(`[MOCK EMAIL BODY PREVIEW] To: ${to} | Subject: ${subject}`);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: getFromAddress(),
      to,
      subject,
      html,
    });
    logger.info(logKey, { to, messageId: info.messageId });
  } catch (err) {
    logger.error(`${logKey}_FAILED`, {
      to,
      error: err instanceof Error ? err.message : String(err),
    });
    // Re-throw so callers can decide whether to surface the error
    throw err;
  }
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string,
): Promise<void> {
  const verificationUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;
  try {
    await dispatchEmail({
      to: email,
      subject: `Verify your email address — ${APP_NAME}`,
      html: verificationEmailHtml(name, verificationUrl),
      logKey: 'EMAIL_VERIFICATION_SENT',
    });
  } catch {
    // Fire-and-forget: verification email failures are logged inside dispatchEmail.
    // We don't throw here so account creation/resend always returns success to the user.
  }
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string,
): Promise<void> {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;
  // Password reset errors ARE surfaced — user must know the email didn’t arrive.
  await dispatchEmail({
    to: email,
    subject: `Reset your password — ${APP_NAME}`,
    html: passwordResetEmailHtml(name, resetUrl),
    logKey: 'EMAIL_RESET_SENT',
  });
}