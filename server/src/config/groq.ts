import Groq from 'groq-sdk';
import { env } from './env.js';
import logger from '../utils/logger.js';

let groqClient: Groq | null = null;

if (env.GROQ_API_KEY) {
  try {
    groqClient = new Groq({ apiKey: env.GROQ_API_KEY });
  } catch (err: any) {
    logger.error('GROQ_INIT_ERROR', { error: err.message });
  }
} else {
  logger.warn('GROQ_API_KEY missing. Fallback AI capabilities will be unavailable.');
}

export { groqClient };
