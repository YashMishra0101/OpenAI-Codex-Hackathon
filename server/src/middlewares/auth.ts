import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP } from '../constants/httpStatus.js';
import { MSG } from '../constants/messages.js';
import logger from '../utils/logger.js';
import type { AccessTokenPayload } from '../types/auth.js';

/**
 * JWT authentication middleware.
 *
 * Token source — reads ONLY from HttpOnly cookies (accessToken).
 *   Why not the Authorization header?
 *   HttpOnly cookies cannot be read by JavaScript — immune to XSS attacks.
 *   The Authorization header with Bearer tokens requires JS access, which makes
 *   the token vulnerable if an XSS vulnerability exists anywhere on the page.
 *
 * On success: attaches { userId, email } to req.user and calls next().
 * On failure: throws ApiError(401) which propagates to the global error handler.
 *
 * The Axios interceptor in the frontend handles the 401 → token refresh flow.
 */
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const token = req.cookies['accessToken'] as string | undefined;

  if (!token) {
    logger.warn('AUTH_MISSING_TOKEN', {
      route: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });
    return next(new ApiError(HTTP.UNAUTHORIZED, MSG.UNAUTHORIZED));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;

    // Type discriminator — ensures a refresh token cannot be used as an access token
    if (decoded.type !== 'access') {
      return next(new ApiError(HTTP.UNAUTHORIZED, MSG.INVALID_TOKEN));
    }

    // Attach authenticated user context to the request
    req.user = { userId: decoded.userId, email: decoded.email };

    return next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      logger.warn('AUTH_TOKEN_EXPIRED', {
        route: req.originalUrl,
        ip: req.ip,
      });
      return next(new ApiError(HTTP.UNAUTHORIZED, MSG.TOKEN_EXPIRED));
    }

    if (err instanceof jwt.JsonWebTokenError) {
      logger.warn('AUTH_TOKEN_INVALID', {
        route: req.originalUrl,
        ip: req.ip,
        reason: err.message,
      });
      return next(new ApiError(HTTP.UNAUTHORIZED, MSG.INVALID_TOKEN));
    }

    return next(err);
  }
}


