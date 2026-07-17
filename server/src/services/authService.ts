import crypto from 'crypto';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP } from '../constants/httpStatus.js';
import { MSG } from '../constants/messages.js';
import logger from '../utils/logger.js';
import { sendVerificationEmail, sendPasswordResetEmail } from './emailService.js';
import { verifyGoogleToken } from '../config/oauth.js';
import type { SafeUser, AccessTokenPayload, RefreshTokenPayload, AuthContext } from '../types/auth.js';
import type {
  RegisterDto,
  LoginDto,
  VerifyEmailDto,
  ResendVerificationDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  GoogleAuthDto,
} from '../validations/authValidation.js';

// ── Token helpers ─────────────────────────────────────────────────────────────

/**
 * Generates a signed access token (short-lived) and refresh token (long-lived).
 * Both tokens include a 'type' discriminator to prevent token type confusion attacks.
 */
function generateTokens(userId: string, email: string): {
  accessToken: string;
  refreshToken: string;
} {
  const accessPayload: AccessTokenPayload = { userId, email, type: 'access' };
  const refreshPayload: RefreshTokenPayload = { userId, type: 'refresh' };

  const accessToken = jwt.sign(accessPayload, env.JWT_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRY,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(refreshPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRY,
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
}

/**
 * Generates a cryptographically secure random token for email verification
 * and password reset. Uses 32 bytes → 64 hex chars.
 */
function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Converts a Mongoose user document to the safe subset returned to the client.
 * Ensures no sensitive fields (password, tokens, private IDs) are exposed.
 */
function toSafeUser(user: {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  isVerified: boolean;
  authProvider: 'email' | 'google';
}): SafeUser {
  return {
    id: user.id as string,
    name: user.name,
    email: user.email,
    profileImage: user.profileImage,
    isVerified: user.isVerified,
    authProvider: user.authProvider,
  };
}

// ── Auth service ──────────────────────────────────────────────────────────────

/**
 * Registers a new user with email/password.
 *
 * Security decisions:
 *   - argon2id (default) is the recommended Argon2 variant — combines
 *     protection against side-channel (argon2i) and GPU attacks (argon2d)
 *   - Verification token uses crypto.randomBytes (CSPRNG), not Math.random()
 *   - Email is already lowercase-normalized by Zod before reaching here
 *
 * @throws ApiError(409) if email already exists
 */
export async function register(dto: RegisterDto): Promise<void> {
  const exists = await User.findOne({ email: dto.email }).lean();
  if (exists) {
    throw new ApiError(HTTP.CONFLICT, MSG.EMAIL_ALREADY_EXISTS);
  }

  const hashedPassword = await argon2.hash(dto.password);
  const verificationToken = generateSecureToken();
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  const user = await User.create({
    name: dto.name,
    email: dto.email,
    password: hashedPassword,
    verificationToken,
    verificationTokenExpiry,
    authProvider: 'email',
  });

  // Fire-and-forget — email failures are logged, not thrown (see emailService.ts)
  await sendVerificationEmail(user.email, user.name, verificationToken);

  logger.info('AUTH_REGISTER', { userId: user.id as string, email: user.email });
}

/**
 * Authenticates a user with email/password and returns tokens + safe user profile.
 *
 * Security decisions:
 *   - Returns the SAME error message for wrong email and wrong password
 *     (prevents user enumeration — attacker can't tell if the email exists)
 *   - Does NOT reveal if the email is unverified before checking the password
 *     (prevents user enumeration via a different error message)
 *
 * @throws ApiError(401) on invalid credentials
 * @throws ApiError(403) if email is not verified
 */
export async function login(
  dto: LoginDto,
  ctx: AuthContext,
): Promise<{ user: SafeUser; accessToken: string; refreshToken: string }> {
  // Select password explicitly (select:false by default)
  const user = await User.findOne({ email: dto.email }).select('+password +refreshToken');

  // Check password BEFORE checking verification status — same error for both
  // "user not found" and "wrong password" prevents user enumeration
  const isValidPassword =
    user?.password != null
      ? await argon2.verify(user.password, dto.password)
      : false;

  if (!user || !isValidPassword) {
    logger.warn('AUTH_LOGIN_FAILED', {
      email: dto.email,
      reason: !user ? 'user_not_found' : 'wrong_password',
      ip: ctx.ip,
    });
    throw new ApiError(HTTP.UNAUTHORIZED, MSG.INVALID_CREDENTIALS);
  }

  // Check email verification AFTER password check to prevent user enumeration
  if (!user.isVerified) {
    throw new ApiError(HTTP.FORBIDDEN, MSG.EMAIL_NOT_VERIFIED);
  }

  const { accessToken, refreshToken } = generateTokens(user.id as string, user.email);

  // Persist refresh token to enable server-side revocation (logout invalidates it)
  user.refreshToken = refreshToken;
  await user.save();

  logger.info('AUTH_LOGIN_SUCCESS', {
    userId: user.id as string,
    email: user.email,
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  });

  return { user: toSafeUser(user as any), accessToken, refreshToken };
}

/**
 * Issues a new access token (and rotates the refresh token) when the client
 * presents a valid refresh token from their HttpOnly cookie.
 *
 * Refresh token rotation: issuing a new refresh token on each use means a
 * stolen refresh token can only be used once before the legitimate user's
 * next request invalidates it.
 *
 * @throws ApiError(401) if the refresh token is invalid or not found in DB
 */
export async function refreshTokens(
  incomingRefreshToken: string,
): Promise<{ accessToken: string; newRefreshToken: string }> {
  let payload: RefreshTokenPayload;

  try {
    payload = jwt.verify(incomingRefreshToken, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new ApiError(HTTP.UNAUTHORIZED, MSG.TOKEN_EXPIRED);
    }
    throw new ApiError(HTTP.UNAUTHORIZED, MSG.INVALID_TOKEN);
  }

  if (payload.type !== 'refresh') {
    throw new ApiError(HTTP.UNAUTHORIZED, MSG.INVALID_TOKEN);
  }

  // Verify the refresh token matches what's stored in DB (server-side revocation)
  const user = await User.findById(payload.userId).select('+refreshToken');
  if (!user || user.refreshToken !== incomingRefreshToken) {
    logger.warn('AUTH_REFRESH_INVALID', { userId: payload.userId });
    throw new ApiError(HTTP.UNAUTHORIZED, MSG.INVALID_TOKEN);
  }

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(
    user.id as string,
    user.email,
  );

  // Rotate refresh token in DB
  user.refreshToken = newRefreshToken;
  await user.save();

  logger.info('AUTH_TOKEN_REFRESHED', { userId: user.id as string });

  return { accessToken, newRefreshToken };
}

/**
 * Logs out the user by clearing the stored refresh token in the DB.
 * Cookie clearing is handled in the controller (HTTP layer).
 */
export async function logout(userId: string): Promise<void> {
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
  logger.info('AUTH_LOGOUT', { userId });
}

/**
 * Verifies the user's email address using the token from the verification link.
 *
 * @throws ApiError(400) if token is invalid or expired
 */
export async function verifyEmail(dto: VerifyEmailDto): Promise<void> {
  const user = await User.findOne({
    verificationToken: dto.token,
    verificationTokenExpiry: { $gt: new Date() },
  }).select('+verificationToken +verificationTokenExpiry');

  if (!user) {
    throw new ApiError(HTTP.BAD_REQUEST, MSG.INVALID_TOKEN);
  }

  await User.findByIdAndUpdate(user._id, {
    isVerified: true,
    $unset: { verificationToken: 1, verificationTokenExpiry: 1 },
  });

  logger.info('AUTH_EMAIL_VERIFIED', { userId: user.id as string, email: user.email });
}

/**
 * Resends the email verification link to a given email address.
 * Silently succeeds if the email is not registered or already verified
 * to prevent user enumeration.
 */
export async function resendVerification(dto: ResendVerificationDto): Promise<void> {
  const user = await User.findOne({ email: dto.email }).select(
    '+verificationToken +verificationTokenExpiry',
  );

  // Silent return if not found or already verified (prevents enumeration)
  if (!user || user.isVerified) return;

  const verificationToken = generateSecureToken();
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  user.verificationToken = verificationToken;
  user.verificationTokenExpiry = verificationTokenExpiry;
  await user.save();

  await sendVerificationEmail(user.email, user.name, verificationToken);

  logger.info('AUTH_VERIFICATION_RESENT', { userId: user.id as string, email: user.email });
}

/**
 * Initiates the forgot-password flow.
 * Silently succeeds if the email is not registered (prevents enumeration).
 */
export async function forgotPassword(dto: ForgotPasswordDto): Promise<void> {
  const user = await User.findOne({ email: dto.email });

  // Always return success — do not reveal whether the email exists
  if (!user) return;

  const resetToken = generateSecureToken();
  const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await User.findByIdAndUpdate(user._id, {
    passwordResetToken: resetToken,
    passwordResetExpiry: resetExpiry,
  });

  await sendPasswordResetEmail(user.email, user.name, resetToken);

  logger.info('AUTH_PASSWORD_RESET_REQUESTED', { userId: user.id as string });
}

/**
 * Resets the user's password using the token from the reset email link.
 * Also clears all active sessions (refresh tokens) for security.
 *
 * @throws ApiError(400) if token is invalid or expired
 */
export async function resetPassword(dto: ResetPasswordDto): Promise<void> {
  const user = await User.findOne({
    passwordResetToken: dto.token,
    passwordResetExpiry: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpiry');

  if (!user) {
    throw new ApiError(HTTP.BAD_REQUEST, MSG.INVALID_TOKEN);
  }

  const hashedPassword = await argon2.hash(dto.password);

  await User.findByIdAndUpdate(user._id, {
    password: hashedPassword,
    $unset: {
      passwordResetToken: 1,
      passwordResetExpiry: 1,
      refreshToken: 1, // Invalidate all existing sessions
    },
  });

  logger.info('AUTH_PASSWORD_RESET', { userId: user.id as string });
}

/**
 * Authenticates or registers a user via Google OAuth.
 * Strategy:
 *   1. Verify Google ID token → extract profile
 *   2. Find user by googleId → return existing Google user
 *   3. Find user by email   → link Google to existing email account
 *   4. Otherwise            → create a new Google-authenticated user
 *
 * Google users are pre-verified (Google validates the email) so isVerified=true.
 */
export async function googleAuth(
  dto: GoogleAuthDto,
  ctx: AuthContext,
): Promise<{ user: SafeUser; accessToken: string; refreshToken: string; isNewUser: boolean }> {
  const profile = await verifyGoogleToken(dto.credential);

  let user = await User.findOne({ googleId: profile.googleId });
  let isNewUser = false;

  if (!user) {
    // Try linking to an existing email account
    user = await User.findOne({ email: profile.email });

    if (user) {
      // Link Google account to existing email account
      user.googleId = profile.googleId;
      user.authProvider = 'google';
      user.isVerified = true;
      if (!user.profileImage && profile.profileImage) {
        user.profileImage = profile.profileImage;
      }
      await user.save();
      logger.info('AUTH_GOOGLE_LINKED', { userId: user.id as string, email: user.email });
    } else {
      // Create a new Google-authenticated user
      user = await User.create({
        name: profile.name,
        email: profile.email,
        googleId: profile.googleId,
        profileImage: profile.profileImage,
        authProvider: 'google',
        isVerified: true, // Google validates the email — no need for our own verification
      });
      isNewUser = true;
      logger.info('AUTH_GOOGLE_REGISTER', { userId: user.id as string, email: user.email });
    }
  }

  const { accessToken, refreshToken } = generateTokens(user.id as string, user.email);

  user.refreshToken = refreshToken;
  await user.save();

  logger.info('AUTH_GOOGLE_LOGIN', {
    userId: user.id as string,
    email: user.email,
    ip: ctx.ip,
    isNewUser,
  });

  return { user: toSafeUser(user as any), accessToken, refreshToken, isNewUser };
}
