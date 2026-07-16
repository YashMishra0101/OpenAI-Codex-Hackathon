/**
 * Global Express Request augmentation.
 *
 * Adds `user` to every Express Request object so TypeScript knows about
 * the authenticated user after the `authenticate` middleware runs.
 *
 * Why augment the global namespace instead of a custom interface?
 *   Using a custom `AuthenticatedRequest` interface would require every
 *   controller to cast `req` to that type. Augmenting the global namespace
 *   means `req.user` is available everywhere without any casting.
 *
 * The field is optional (`?`) because unauthenticated routes don't set it.
 * Protected routes can safely assert `req.user!` after the `authenticate`
 * middleware — if auth fails, the middleware throws before the handler runs.
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

// This empty export makes the file a module (required for global augmentation
// to work correctly in TypeScript's module system)
export {};
