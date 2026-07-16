import winston from 'winston';

const { combine, timestamp, json, colorize, printf, errors } = winston.format;

const isDev = process.env['NODE_ENV'] !== 'production';
const isTest = process.env['NODE_ENV'] === 'test';

/**
 * Structured logger using Winston.
 *
 * Development: colorized, human-readable console output.
 * Production:  JSON format for log aggregation services (Sentry, Datadog, etc.).
 * Test:        Silent — keeps test output clean.
 *
 * Security note: never log passwords, tokens, or secrets.
 * All auth-related logs include event type and context, never the sensitive value itself.
 */
const logger = winston.createLogger({
  // Log level: debug in dev (verbose), info in production (signal over noise)
  level: isDev ? 'debug' : 'info',
  // Silence all output in test environment
  silent: isTest,
  format: combine(
    // Attach stack traces to Error objects
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    isDev
      ? combine(
          colorize({ all: true }),
          printf(({ level, message, timestamp: ts, ...meta }) => {
            const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
            return `${String(ts)} [${level}]: ${String(message)}${metaStr}`;
          }),
        )
      : json(),
  ),
  transports: [new winston.transports.Console()],
});

// Expose an 'http' level alias used for request logging in app.ts
// Winston's built-in levels: error, warn, info, http, verbose, debug, silly
export default logger;
