/**
 * Named HTTP status code constants.
 *
 * Using named constants instead of magic numbers:
 *   ✓ Self-documenting: HTTP.NOT_FOUND reads better than 404
 *   ✓ Typo-proof: a typo in the constant name is a compile error
 *   ✓ Single place to change if a value ever needs updating
 */
export const HTTP = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export type HttpStatus = (typeof HTTP)[keyof typeof HTTP];
