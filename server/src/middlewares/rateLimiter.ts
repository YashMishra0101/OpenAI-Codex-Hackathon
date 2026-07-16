import rateLimit from 'express-rate-limit';
import { HTTP } from '../constants/httpStatus.js';
import { MSG } from '../constants/messages.js';

/**
 * Shared rate limiter configuration.
 *
 * Why separate auth rate limiters from the AI rate limiter?
 *   Auth routes are the target of brute-force and credential-stuffing attacks.
 *   A tighter, dedicated limiter stops the attack before it reaches argon2
 *   (which is intentionally slow). Defense in depth.
 *
 * Per project_info.md:
 *   /login           — 10 attempts / 15 min per IP
 *   /register        — 5 attempts  / 15 min per IP
 *   /forgot-password — 3 attempts  / 15 min per IP
 */

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const rateLimitResponse = (message: string) => ({
  success: false,
  statusCode: HTTP.TOO_MANY_REQUESTS,
  message,
  errors: [],
});

/** 10 login attempts per 15 minutes per IP */
export const loginLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse(MSG.TOO_MANY_REQUESTS),
  skipSuccessfulRequests: true, // Only count failed attempts
});

/** 5 registration attempts per 15 minutes per IP */
export const registerLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse(MSG.TOO_MANY_REQUESTS),
});

/** 3 forgot-password attempts per 15 minutes per IP — tightest limit */
export const forgotPasswordLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse(MSG.TOO_MANY_REQUESTS),
});
