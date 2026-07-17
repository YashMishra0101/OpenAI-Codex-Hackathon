import express, { type Application, type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
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

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl, mobile apps)
      if (!origin || allowedOrigins.includes(origin)) {
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

// ── 5. Request logging (dev-friendly, structured) ────────────────────────────
app.use((req: Request, _res: Response, next: NextFunction): void => {
  logger.http(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// ── 6. Health Check (UptimeRobot) ─────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 7. API routes ─────────────────────────────────────────────────────────────
app.use('/api/v1', apiRouter);

// ── 8. Sentry Error Handler ──────────────────────────────────────────────────
if (env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

// ── 9. Global error handler — ALWAYS last ────────────────────────────────────
app.use(errorHandler);

export default app;
