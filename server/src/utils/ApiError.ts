/**
 * Custom operational error class.
 *
 * isOperational = true  → known, expected error (invalid input, not found, auth failure).
 *                         The error handler sends the message to the client.
 * isOperational = false → unexpected programmer error (bug, assertion failure).
 *                         The error handler returns a generic 500 and logs the details.
 *
 * Why extend Error?
 *   To preserve the prototype chain and allow `instanceof ApiError` checks in
 *   the global error handler without using duck-typing.
 */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly errors: unknown[];
  readonly isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    errors: unknown[] = [],
    isOperational = true,
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;

    // Maintains proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);

    // Captures the call site — excludes the ApiError constructor from the stack
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
