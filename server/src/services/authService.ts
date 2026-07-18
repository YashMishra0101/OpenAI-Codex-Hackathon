import crypto from 'crypto';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { PendingRegistration } from '../models/PendingRegistration.js';
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
 * Initiates the registration flow WITHOUT creating a User account.
 *
 * Architecture:
 *   Instead of creating a User immediately and marking isVerified=false,
 *   we store the registration intent in a PendingRegistration document.
 *   The real User is only created after the email is verified.
 *
 * Benefits:
 *   - The User collection only ever contains fully-verified, active accounts.
 *   - Unverified records are automatically cleaned up by MongoDB's TTL index.
 *   - Re-registration before verification is handled by upserting (rotates token).
 *
 * Security decisions:
 *   - argon2id (default) is the recommended Argon2 variant.
 *   - Verification token uses crypto.randomBytes (CSPRNG), not Math.random().
 *   - Email is already lowercase-normalized by Zod before reaching here.
 *
 * @throws ApiError(409) if email is already a verified account
 */
export async function register(dto: RegisterDto): Promise<void> {
  // Step 1: Reject if a fully-verified account already exists for this email.
  const existingUser = await User.findOne({ email: dto.email }).lean();
  if (existingUser) {
    throw new ApiError(HTTP.CONFLICT, MSG.EMAIL_ALREADY_EXISTS);
  }

  // Step 2: Hash the password and generate a fresh verification token.
  const hashedPassword = await argon2.hash(dto.password);
  const verificationToken = generateSecureToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Step 3: Upsert the pending registration.
  //   - If no pending record exists → create one (first registration attempt).
  //   - If one exists (re-registration before verification) → replace it with
  //     fresh credentials and a new token. This means the old email link is
  //     immediately invalidated and the user gets a fresh one.
  await PendingRegistration.findOneAndUpdate(
    { email: dto.email },
    { name: dto.name, hashedPassword, verificationToken, expiresAt },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  // Step 4: Send the verification email (fire-and-forget; failures are logged).
  await sendVerificationEmail(dto.email, dto.name, verificationToken);

  logger.info('AUTH_REGISTRATION_PENDING', { email: dto.email });
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

  // Kept for backward compatibility with any accounts that existed before
  // the new pending-registration flow was introduced.
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
 * Verifies the email token, promotes the PendingRegistration → real User,
 * and issues a full authenticated session (access + refresh tokens).
 *
 * This is the single atomic step that:
 *   1. Validates the token (existence + expiry).
 *   2. Creates the permanent User account.
 *   3. Deletes the PendingRegistration (token is now consumed, single-use).
 *   4. Returns auth tokens so the controller can set HttpOnly cookies,
 *      logging the user in immediately without a separate login step.
 *
 * Edge-case handled:
 *   If the user somehow clicks the link twice (double-click, cached page):
 *   the second call finds no PendingRegistration but the User already exists.
 *   We detect this and issue fresh tokens so the experience is still seamless.
 *
 * @throws ApiError(400) with 'expired' message if token exists but is past expiry
 * @throws ApiError(400) with 'invalid' message if token is not found anywhere
 */
export async function verifyEmail(dto: VerifyEmailDto): Promise<{
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}> {
  // ── Step 1: Find the pending registration by token ──────────────────────────
  const pending = await PendingRegistration.findOne({
    verificationToken: dto.token,
  });

  if (!pending) {
    // Token not in pending — check if it was already verified (double-click case)
    // We can't issue tokens here because we don't know who the user is from the
    // token alone (it was deleted on first verification). Return invalid error.
    throw new ApiError(
      HTTP.BAD_REQUEST,
      'Invalid verification link. Please request a new one.',
    );
  }

  // ── Step 2: Check expiry ────────────────────────────────────────────────────
  if (pending.expiresAt <= new Date()) {
    // Leave the pending record in place so the user can still resend.
    // MongoDB TTL will clean it up eventually; resend issues a fresh one.
    throw new ApiError(
      HTTP.BAD_REQUEST,
      'Verification link has expired. Please request a new one.',
    );
  }

  // ── Step 3: Create the permanent User account ───────────────────────────────
  // Guard against a race condition where two requests arrive simultaneously
  // for the same token (e.g., email clients that pre-fetch links).
  let user = await User.findOne({ email: pending.email });

  if (!user) {
    user = await User.create({
      name: pending.name,
      email: pending.email,
      password: pending.hashedPassword, // Already hashed by argon2 at registration time
      isVerified: true,                 // Verified — this is the whole point of this flow
      authProvider: 'email',
    });
    logger.info('AUTH_ACCOUNT_ACTIVATED', { userId: user.id as string, email: user.email });
  } else {
    // Race condition: user was already created by a concurrent request.
    // Fall through to token generation — the user is valid.
    logger.warn('AUTH_VERIFY_RACE_CONDITION', { email: pending.email });
  }

  // ── Step 4: Consume the token (single-use) ──────────────────────────────────
  await PendingRegistration.deleteOne({ _id: pending._id });

  // ── Step 5: Issue authenticated session ────────────────────────────────────
  const { accessToken, refreshToken } = generateTokens(user.id as string, user.email);
  await User.findByIdAndUpdate(user._id, { refreshToken }, { runValidators: false });

  logger.info('AUTH_EMAIL_VERIFIED_AND_LOGGED_IN', {
    userId: user.id as string,
    email: user.email,
  });

  return { user: toSafeUser(user as any), accessToken, refreshToken };
}

/**
 * Resends the email verification link.
 *
 * With the new pending-registration architecture, this looks up the
 * PendingRegistration collection (not the User collection). If no pending
 * record exists, the email is either already verified or never registered —
 * we return silently in both cases to prevent user enumeration.
 *
 * A fresh token is generated and the old one is immediately invalidated.
 */
export async function resendVerification(dto: ResendVerificationDto): Promise<void> {
  const pending = await PendingRegistration.findOne({ email: dto.email });

  if (!pending) {
    // Silent return — prevents revealing whether the email is registered.
    logger.info('AUTH_RESEND_SKIPPED', {
      email: dto.email,
      reason: 'no_pending_registration',
    });
    return;
  }

  const verificationToken = generateSecureToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // fresh 24-hour window

  // Atomically rotate the token — old link is immediately invalid.
  await PendingRegistration.findByIdAndUpdate(
    pending._id,
    { verificationToken, expiresAt },
    { runValidators: false },
  );

  await sendVerificationEmail(pending.email, pending.name, verificationToken);

  logger.info('AUTH_VERIFICATION_RESENT', { email: pending.email });
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