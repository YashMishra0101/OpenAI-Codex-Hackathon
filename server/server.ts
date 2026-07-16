// Load .env into process.env BEFORE any other import runs.
// In production (Render), env vars are set by the platform — dotenv is a silent no-op.
import 'dotenv/config';

// Step 1: Validate ALL env vars first — crashes immediately with a clear Zod error
// if any required variable is missing, before anything else runs (fail-fast principle).
import './src/config/env.js';

// Step 2: Now safe to import everything else — env vars are guaranteed to exist.
import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { initSentry } from './src/config/sentry.js';
import { env } from './src/config/env.js';
import logger from './src/utils/logger.js';
import { startAgenda } from './src/config/agenda.js';

const startServer = async (): Promise<void> => {
  // Initialize Sentry error monitoring (production only)
  initSentry();

  // Step 3: Connect to MongoDB — env vars are guaranteed to exist at this point
  await connectDB();

  // Step 4: Start Background Jobs (Agenda)
  await startAgenda();

  // Step 5: Start Express server
  app.listen(env.PORT, () => {
    logger.info(`Server running in ${env.NODE_ENV} mode`, { port: env.PORT });
  });
};

startServer().catch((error: unknown) => {
  logger.error('Fatal: server failed to start', {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
