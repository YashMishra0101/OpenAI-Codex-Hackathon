import { z } from 'zod';

// ── Register ─────────────────────────────────────────────────────────────────
export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be 100 characters or fewer')
    .trim(),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be 72 characters or fewer'),
});

// ── Login ─────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

// ── Email Verification ────────────────────────────────────────────────────────
export const verifyEmailSchema = z.object({
  token: z.string({ required_error: 'Verification token is required' }).min(1),
});

export const resendVerificationSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),
});

// ── Password Reset ────────────────────────────────────────────────────────────
export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),
});

export const resetPasswordSchema = z.object({
  token: z.string({ required_error: 'Reset token is required' }).min(1),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be 72 characters or fewer'),
});

// ── Google OAuth ──────────────────────────────────────────────────────────────
export const googleAuthSchema = z.object({
  // The credential (ID token) returned by @react-oauth/google's onSuccess callback
  credential: z.string({ required_error: 'Google credential token is required' }).min(1),
});

// ── Inferred TypeScript types from Zod schemas ────────────────────────────────
// Types are derived from the schema — never duplicate the shape as a separate interface.
export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationDto = z.infer<typeof resendVerificationSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
export type GoogleAuthDto = z.infer<typeof googleAuthSchema>;
