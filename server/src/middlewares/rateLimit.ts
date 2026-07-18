import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/ApiError.js';
import { HTTP } from '../constants/httpStatus.js';

/**
 * Global rate limiter applied to all /api/v1/ routes.
 * Prevents basic volumetric DDoS and excessive scraping.
 * Limit: 100 requests per 15 minutes per IP.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next) => {
    next(new ApiError(HTTP.TOO_MANY_REQUESTS, 'Too many requests from this IP, please try again after 15 minutes.'));
  },
});

/**
 * Strict rate limiter for authentication routes (login, register, forgot-password).
 * Prevents credential stuffing and brute-force password attacks.
 * Limit: 5 requests per 15 minutes per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ApiError(HTTP.TOO_MANY_REQUESTS, 'Too many authentication attempts from this IP, please try again after 15 minutes.'));
  },
});
