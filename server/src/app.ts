import express, { type Application, type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import logger from './utils/logger.js';

import * as Sentry from '@sentry/node';

const app: Application = express();

// ── 0. Sentry Initialization ─────────────────────────────────────────────────
if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    // Tracing
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
  });
}

// ── 1. Security headers — must be registered before all other middleware ─────
app.use(helmet());

// ── 2. CORS — must come before routes ────────────────────────────────────────
// credentials:true is MANDATORY: allows HttpOnly cookies to be sent cross-origin.
// Without this, every authenticated request fails with 401 silently.
const allowedOrigins = ['http://localhost:5173', env.CLIENT_URL].filter(
  (o): o is string => Boolean(o),
);

const isAllowedDevOrigin = (origin: string): boolean => {
  if (env.NODE_ENV !== 'development') return false;

  try {
    const url = new URL(origin);
    return ['localhost', '127.0.0.1'].includes(url.hostname);
  } catch {
    return false;
  }
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl, mobile apps)
      if (!origin || allowedOrigins.includes(origin) || isAllowedDevOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin "${origin}" is not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// ── 3. Body parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── 4. Cookie parsing ─────────────────────────────────────────────────────────
app.use(cookieParser());

// ── 5. Rate Limiting ──────────────────────────────────────────────────────────
// Three tiers of rate limiting, applied from most specific to least.

// Tier 1: Strict auth limiter — protects against brute-force on login/register/etc.
// Applies to: login, register, forgot-password, Google auth.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 attempts per window per IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests from this IP. Please try again in 15 minutes.',
  },
  skip: () => env.NODE_ENV === 'test', // Don't rate-limit during tests
});

// Tier 1b: Resend-verification limiter — stricter than general auth.
// 3 resends per 15 minutes per IP is generous for real users but blocks spam.
const resendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,                    // 3 resend attempts per window per IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many resend attempts. Please wait 15 minutes before trying again.',
  },
  skip: () => env.NODE_ENV === 'test',
});

// Tier 2: AI analysis limiter — protects AI API quota from abuse.
// 5 resume analyses per 15 minutes per IP is generous for real users.
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many analysis requests. Please wait 15 minutes before trying again.',
  },
  skip: () => env.NODE_ENV === 'test',
});

// Tier 3: General API limiter — global guard against scripted abuse.
// 200 requests per 15 minutes is very permissive for genuine users.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests. Please slow down and try again later.',
  },
  skip: () => env.NODE_ENV === 'test',
});

// Apply general limiter to all API routes
app.use('/api/v1', generalLimiter);

// Apply strict auth limiter to sensitive auth endpoints
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1/auth/forgot-password', authLimiter);
app.use('/api/v1/auth/resend-verification', resendLimiter); // Own stricter limiter
app.use('/api/v1/auth/google', authLimiter);

// Apply AI limiter to the resume analysis endpoint
app.use('/api/v1/resumes/analyze', aiLimiter);

// ── 6. Request logging (dev-friendly, structured) ────────────────────────────
app.use((req: Request, _res: Response, next: NextFunction): void => {
  logger.http(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// ── 7. Health Check (UptimeRobot) ─────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 8. API routes ─────────────────────────────────────────────────────────────
app.use('/api/v1', apiRouter);

// ── 9. Sentry Error Handler ──────────────────────────────────────────────────
if (env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

// ── 10. Global error handler — ALWAYS last ───────────────────────────────────
app.use(errorHandler);

export default app;
