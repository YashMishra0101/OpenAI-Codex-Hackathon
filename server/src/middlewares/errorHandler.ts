import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Error as MongooseError } from 'mongoose';
import { MongoServerError } from 'mongodb';
import { ApiError } from '../utils/ApiError.js';
import { HTTP } from '../constants/httpStatus.js';
import { MSG } from '../constants/messages.js';
import logger from '../utils/logger.js';

/**
 * Global Express error handler — always registered last in app.ts.
 *
 * Handles the following error types in priority order:
 *   1. ApiError       — operational errors thrown by controllers/services
 *   2. ZodError       — validation failures from the validate() middleware
 *   3. CastError      — Mongoose invalid ObjectId (e.g. /jobs/not-an-id)
 *   4. ValidationError — Mongoose schema validation failures
 *   5. MongoServerError code 11000 — duplicate key (e.g. email already registered)
 *   6. Unknown        — programmer errors; log privately, return generic 500
 *
 * Security: stack traces and internal error details are NEVER sent to the client
 * in production — only in development where they aid debugging.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const isDev = process.env['NODE_ENV'] === 'development';

  // 1. Operational ApiError
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
      ...(isDev && { stack: err.stack }),
    });
    return;
  }

  // 2. Zod validation error (from validate() middleware or manual parsing)
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(HTTP.UNPROCESSABLE_ENTITY).json({
      success: false,
      statusCode: HTTP.UNPROCESSABLE_ENTITY,
      message: MSG.VALIDATION_ERROR,
      errors,
    });
    return;
  }

  // 3. Mongoose CastError — invalid ObjectId in route params
  if (err instanceof MongooseError.CastError) {
    res.status(HTTP.BAD_REQUEST).json({
      success: false,
      statusCode: HTTP.BAD_REQUEST,
      message: `Invalid ${err.path} value`,
      errors: [],
    });
    return;
  }

  // 4. Mongoose schema ValidationError
  if (err instanceof MongooseError.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    res.status(HTTP.BAD_REQUEST).json({
      success: false,
      statusCode: HTTP.BAD_REQUEST,
      message: MSG.VALIDATION_ERROR,
      errors,
    });
    return;
  }

  // 5. MongoDB duplicate key error (e.g. unique email constraint)
  if (err instanceof MongoServerError && (err as any).code === 11000) {
    const keyValue = (err as any).keyValue as Record<string, unknown> | undefined;
    const field = keyValue ? Object.keys(keyValue)[0] ?? 'field' : 'field';
    res.status(HTTP.CONFLICT).json({
      success: false,
      statusCode: HTTP.CONFLICT,
      message: `${field} already exists`,
      errors: [],
    });
    return;
  }

  // 6. Unknown / programmer error — log internally, return generic 500
  logger.error('Unhandled error', {
    method: req.method,
    url: req.originalUrl,
    error: err instanceof Error ? err.message : String(err),
    ...(isDev && { stack: err instanceof Error ? err.stack : undefined }),
  });

  res.status(HTTP.INTERNAL_SERVER_ERROR).json({
    success: false,
    statusCode: HTTP.INTERNAL_SERVER_ERROR,
    message: MSG.INTERNAL_SERVER_ERROR,
    errors: [],
    ...(isDev && {
      detail: err instanceof Error ? err.message : String(err),
    }),
  });
}
