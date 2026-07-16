import * as Sentry from '@sentry/node';
import { env } from './env.js';
import logger from '../utils/logger.js';

/**
 * Initializes Sentry error monitoring.
 * Only active in production and only when SENTRY_DSN is configured.
 * Calling this in development is intentionally a no-op.
 */
export function initSentry(): void {
  if (env.NODE_ENV !== 'production' || !env.SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    // Capture 10% of transactions for performance monitoring
    tracesSampleRate: 0.1,
    // Do not log Sentry debug output to the console
    debug: false,
  });

  logger.info('Sentry error monitoring initialized');
}
