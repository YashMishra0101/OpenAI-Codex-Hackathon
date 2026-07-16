/**
 * Environment variable validation — runs at application startup before anything else.
 *
 * Using Zod's .parse() (not .safeParse()) is intentional:
 *   - .parse() throws immediately if a variable is missing or invalid
 *   - The app fails fast with a clear, descriptive error
 *   - A misconfigured deployment is immediately obvious instead of causing
 *     mysterious runtime failures when the missing variable is first accessed
 *
 * Import this module FIRST in server.ts to guarantee env vars exist
 * before any database connection or service initialization.
 */
import { z } from 'zod';

const envSchema = z.object({
  // ── Core ──────────────────────────────────────────────────────────────────
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z
    .string()
    .default('5000')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),

  // ── Database ──────────────────────────────────────────────────────────────
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  // ── JWT ───────────────────────────────────────────────────────────────────
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  ACCESS_TOKEN_EXPIRY: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRY: z.string().default('7d'),

  // ── Client ────────────────────────────────────────────────────────────────
  CLIENT_URL: z.string().min(1, 'CLIENT_URL is required'),

  // ── AI — optional at startup; validated when feature is used ─────────────
  GEMINI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),

  // ── Cloudinary — optional at startup; validated when feature is used ──────
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // ── Email — optional at startup; validated when feature is used ───────────
  RESEND_API_KEY: z.string().optional(),

  // ── Google OAuth — optional at startup; validated when feature is used ────
  GOOGLE_CLIENT_ID: z.string().optional(),

  // ── Monitoring — fully optional (only active in production) ───────────────
  SENTRY_DSN: z.string().url().optional(),
});

// This line executes immediately on import — fails fast if required vars are missing.
export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
