import type { Response, CookieOptions } from 'express';
import type { Request } from 'express';
import * as authService from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP } from '../constants/httpStatus.js';
import { MSG } from '../constants/messages.js';
import { env } from '../config/env.js';
import type {
  RegisterDto,
  LoginDto,
  VerifyEmailDto,
  ResendVerificationDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  GoogleAuthDto,
} from '../validations/authValidation.js';

// ── Cookie helpers ────────────────────────────────────────────────────────────
// Centralized here so all auth flows use identical cookie settings.
// Changing from sameSite:'strict' to 'none' (for cross-site scenarios) is
// a single-point change rather than hunting through every controller.

const cookieBase: CookieOptions = {
  httpOnly: true,                              // Not readable by client JS — XSS protection
  secure: env.NODE_ENV === 'production',       // HTTPS-only in production
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax', // MUST be 'none' for cross-site (Vercel -> Render)
  path: '/',
};

const accessCookieOptions: CookieOptions = {
  ...cookieBase,
  maxAge: 15 * 60 * 1000,                     // 15 minutes
};

const refreshCookieOptions: CookieOptions = {
  ...cookieBase,
  maxAge: 7 * 24 * 60 * 60 * 1000,            // 7 days
};

function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
  res.cookie('accessToken', accessToken, accessCookieOptions);
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);
}

function clearAuthCookies(res: Response): void {
  res.clearCookie('accessToken', cookieBase);
  res.clearCookie('refreshToken', cookieBase);
}

// ── Auth controller ───────────────────────────────────────────────────────────
// Thin controllers: handle HTTP only (cookies, status codes, response shape).
// All business logic, validation, and logging live in authService.ts.

export const authController = {
  /**
   * POST /api/v1/auth/register
   * Creates a new account and sends a verification email.
   */
  register: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const dto = req.body as RegisterDto;
    await authService.register(dto);
    res
      .status(HTTP.CREATED)
      .json(new ApiResponse(HTTP.CREATED, MSG.REGISTER_SUCCESS, null));
  }),

  /**
   * POST /api/v1/auth/login
   * Authenticates credentials and sets HttpOnly JWT cookies.
   */
  login: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const dto = req.body as LoginDto;
    const ctx = {
      ip: req.ip ?? 'unknown',
      userAgent: req.get('user-agent') ?? 'unknown',
    };
    const { user, accessToken, refreshToken } = await authService.login(dto, ctx);
    setAuthCookies(res, accessToken, refreshToken);
    res.status(HTTP.OK).json(new ApiResponse(HTTP.OK, MSG.LOGIN_SUCCESS, { user }));
  }),

  /**
   * POST /api/v1/auth/logout
   * Clears cookies and invalidates the refresh token in the DB.
   * authenticate middleware guarantees req.user exists on this route.
   */
  logout: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    if (userId) await authService.logout(userId);
    clearAuthCookies(res);
    res.status(HTTP.OK).json(new ApiResponse(HTTP.OK, MSG.LOGOUT_SUCCESS, null));
  }),

  /**
   * POST /api/v1/auth/refresh
   * Silently refreshes the access token using the refresh cookie.
   * Used by the Axios interceptor in the frontend.
   */
  refresh: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const incomingRefreshToken = req.cookies['refreshToken'] as string | undefined;
    if (!incomingRefreshToken) {
      throw new ApiError(HTTP.UNAUTHORIZED, MSG.TOKEN_EXPIRED);
    }
    const { accessToken, newRefreshToken } = await authService.refreshTokens(
      incomingRefreshToken,
    );
    setAuthCookies(res, accessToken, newRefreshToken);
    res.status(HTTP.OK).json(new ApiResponse(HTTP.OK, MSG.TOKEN_REFRESHED, null));
  }),

  /**
   * POST /api/v1/auth/verify-email
   * Activates the account, creates a session, and returns the authenticated user.
   * After this call the client has valid auth cookies and is fully logged in.
   */
  verifyEmail: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const dto = req.body as VerifyEmailDto;
    const { user, accessToken, refreshToken } = await authService.verifyEmail(dto);
    setAuthCookies(res, accessToken, refreshToken);
    res.status(HTTP.OK).json(new ApiResponse(HTTP.OK, MSG.EMAIL_VERIFIED, { user }));
  }),

  /**
   * POST /api/v1/auth/resend-verification
   * Resends the verification email. Always returns 200 (prevents enumeration).
   */
  resendVerification: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const dto = req.body as ResendVerificationDto;
    await authService.resendVerification(dto);
    res.status(HTTP.OK).json(new ApiResponse(HTTP.OK, MSG.VERIFICATION_RESENT, null));
  }),

  /**
   * POST /api/v1/auth/forgot-password
   * Sends a password reset email. Always returns 200 (prevents enumeration).
   */
  forgotPassword: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const dto = req.body as ForgotPasswordDto;
    await authService.forgotPassword(dto);
    res.status(HTTP.OK).json(new ApiResponse(HTTP.OK, MSG.PASSWORD_RESET_SENT, null));
  }),

  /**
   * POST /api/v1/auth/reset-password
   * Resets the password and invalidates all active sessions.
   */
  resetPassword: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const dto = req.body as ResetPasswordDto;
    await authService.resetPassword(dto);
    res.status(HTTP.OK).json(new ApiResponse(HTTP.OK, MSG.PASSWORD_RESET_SUCCESS, null));
  }),

  /**
   * POST /api/v1/auth/google
   * One-click Google sign-in/sign-up via @react-oauth/google credential token.
   */
  googleAuth: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const dto = req.body as GoogleAuthDto;
    const ctx = {
      ip: req.ip ?? 'unknown',
      userAgent: req.get('user-agent') ?? 'unknown',
    };
    const { user, accessToken, refreshToken } = await authService.googleAuth(dto, ctx);
    setAuthCookies(res, accessToken, refreshToken);
    res.status(HTTP.OK).json(new ApiResponse(HTTP.OK, MSG.LOGIN_SUCCESS, { user }));
  }),
};
