import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
} from '../middlewares/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleAuthSchema,
} from '../validations/authValidation.js';

const router = Router();

/**
 * Auth routes — all prefixed with /api/v1/auth
 *
 * Middleware order per route:
 *   1. Rate limiter    — blocks brute-force before any expensive DB/argon2 work
 *   2. validate()      — Zod input validation before business logic runs
 *   3. authenticate    — JWT check for protected routes (logout)
 *   4. authController  — thin HTTP handler that calls authService
 *
 * All routes follow RESTful conventions:
 *   POST /register         — create a new account
 *   POST /login            — start a session (returns HttpOnly cookies)
 *   POST /logout           — end a session (requires auth)
 *   POST /refresh          — silently refresh the access token
 *   POST /verify-email     — confirm email address
 *   POST /resend-verification — send a new verification link
 *   POST /forgot-password  — request a password reset link
 *   POST /reset-password   — set a new password using the reset token
 *   POST /google           — Google One-Tap sign-in/sign-up
 */

// ── Public routes ─────────────────────────────────────────────────────────────

router.post(
  '/register',
  registerLimiter,
  validate(registerSchema),
  authController.register,
);

router.post(
  '/login',
  loginLimiter,
  validate(loginSchema),
  authController.login,
);

router.post(
  '/refresh',
  authController.refresh,
);

router.post(
  '/verify-email',
  validate(verifyEmailSchema),
  authController.verifyEmail,
);

router.post(
  '/resend-verification',
  validate(resendVerificationSchema),
  authController.resendVerification,
);

router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);

router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  authController.resetPassword,
);

router.post(
  '/google',
  validate(googleAuthSchema),
  authController.googleAuth,
);

// ── Protected routes ──────────────────────────────────────────────────────────

router.post(
  '/logout',
  authenticate,
  authController.logout,
);

export default router;
