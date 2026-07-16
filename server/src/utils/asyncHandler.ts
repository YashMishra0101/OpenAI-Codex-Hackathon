import type { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncController = (req: Request, res: Response, next: NextFunction) => Promise<void>;

/**
 * Wraps an async Express route handler to catch rejected promises and
 * forward errors to the global error handler via next(err).
 *
 * Without this, an unhandled promise rejection in an async controller
 * would crash the process in Node.js or silently hang the request.
 *
 * Note: Express 5 natively handles async errors, but this wrapper is kept
 * for explicitness, testability, and compatibility with any Express 4
 * middleware in the dependency tree.
 *
 * Usage:
 *   router.post('/register', asyncHandler(authController.register));
 */
export const asyncHandler = (fn: AsyncController): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
