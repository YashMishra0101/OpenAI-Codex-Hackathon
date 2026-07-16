import type { Request, Response, NextFunction } from 'express';
import type { AnyZodObject } from 'zod';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';
import { HTTP } from '../constants/httpStatus.js';
import { MSG } from '../constants/messages.js';

type ValidateTarget = 'body' | 'query' | 'params';

/**
 * Zod validation middleware factory.
 *
 * Usage:
 *   router.post('/register', validate(registerSchema), asyncHandler(authController.register));
 *   router.get('/jobs', validate(jobQuerySchema, 'query'), asyncHandler(jobController.list));
 *
 * On success: calls next() so the route handler runs with validated, typed input.
 * On failure: forwards a structured ApiError to the global error handler.
 *
 * Note: Zod's .parse() strips unknown fields (safe defaults). Use .passthrough() on the
 * schema if unknown keys must be preserved.
 */
export const validate =
  (schema: AnyZodObject, target: ValidateTarget = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      schema.parse(req[target]);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        next(new ApiError(HTTP.UNPROCESSABLE_ENTITY, MSG.VALIDATION_ERROR, errors));
      } else {
        next(error);
      }
    }
  };
