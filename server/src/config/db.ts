import mongoose from 'mongoose';
import { env } from './env.js';
import logger from '../utils/logger.js';

const MAX_RETRIES = 5;
const BASE_RETRY_DELAY_MS = 3_000;

/**
 * Connects to MongoDB with exponential-backoff retry logic.
 *
 * Why retry instead of crash-on-first-failure?
 *   On Render's free tier, the server and MongoDB Atlas can both be cold-starting
 *   simultaneously. A brief connection window mismatch would permanently kill the
 *   server without retries. Five attempts with increasing delays covers typical
 *   cold-start latencies without waiting indefinitely.
 */
export async function connectDB(attempt = 1): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10_000,
    });
    logger.info('MongoDB connected successfully', {
      host: mongoose.connection.host,
      dbName: mongoose.connection.name,
    });
  } catch (error) {
    const isLastAttempt = attempt >= MAX_RETRIES;

    if (isLastAttempt) {
      logger.error('MongoDB connection failed after maximum retries — exiting', {
        error: error instanceof Error ? error.message : String(error),
        attempts: attempt,
      });
      process.exit(1);
    }

    const delayMs = BASE_RETRY_DELAY_MS * attempt;
    logger.warn('MongoDB connection failed — retrying', {
      attempt,
      maxRetries: MAX_RETRIES,
      retryInMs: delayMs,
      error: error instanceof Error ? error.message : String(error),
    });

    await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
    return connectDB(attempt + 1);
  }
}

// Graceful shutdown — close connection when process terminates
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

process.on('SIGINT', () => {
  void mongoose.connection.close().then(() => {
    logger.info('MongoDB connection closed (SIGINT)');
    process.exit(0);
  });
});
