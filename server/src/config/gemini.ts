import { GoogleGenAI } from '@google/genai';
import { env } from './env.js';
import logger from '../utils/logger.js';

let geminiClient: GoogleGenAI | null = null;

if (env.GEMINI_API_KEY) {
  try {
    geminiClient = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  } catch (err: any) {
    logger.error('GEMINI_INIT_ERROR', { error: err.message });
  }
} else {
  logger.warn('GEMINI_API_KEY missing. Primary AI capabilities will be unavailable.');
}

export { geminiClient };
