/**
 * Application-wide message constants.
 * Centralizing strings here prevents inconsistencies across the API surface.
 */
export const MSG = {
  // ── Generic ───────────────────────────────────────────────────────────────
  INTERNAL_SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  VALIDATION_ERROR: 'Validation failed. Please check your input.',
  NOT_FOUND: 'The requested resource was not found.',
  UNAUTHORIZED: 'Authentication required. Please log in.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  TOO_MANY_REQUESTS: 'Too many requests. Please slow down and try again later.',

  // ── Auth ─────────────────────────────────────────────────────────────────
  REGISTER_SUCCESS: 'Account created successfully. Please verify your email.',
  LOGIN_SUCCESS: 'Logged in successfully.',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  TOKEN_REFRESHED: 'Access token refreshed.',
  EMAIL_VERIFIED: 'Email verified successfully.',
  VERIFICATION_SENT: 'Verification email sent. Please check your inbox.',
  VERIFICATION_RESENT: 'Verification email resent.',
  PASSWORD_RESET_SENT: 'Password reset instructions sent to your email.',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully. You can now log in.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_NOT_VERIFIED: 'Please verify your email before logging in.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  INVALID_TOKEN: 'Invalid or expired token.',
  OAUTH_ERROR: 'Google sign-in failed. Please try again.',

  // ── Profile ──────────────────────────────────────────────────────────────
  PROFILE_UPDATED: 'Profile updated successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  PROFILE_IMAGE_UPDATED: 'Profile picture updated successfully.',

  // ── Resume analysis ──────────────────────────────────────────────────────
  ANALYSIS_SUCCESS: 'Resume analysis completed successfully.',
  ANALYSIS_CACHED: 'Analysis retrieved from cache.',
  ANALYSIS_NOT_FOUND: 'Analysis not found.',
  AI_SERVICE_UNAVAILABLE:
    'Our analysis service is temporarily unavailable. Please try again in a few minutes.',
  INVALID_PDF: 'The uploaded file could not be parsed. Please upload a valid PDF.',
  PDF_TOO_LARGE: 'Resume PDF must be 5MB or smaller.',

  // ── Job tracker ──────────────────────────────────────────────────────────
  JOB_CREATED: 'Job application added successfully.',
  JOB_UPDATED: 'Job application updated successfully.',
  JOB_DELETED: 'Job application deleted successfully.',
  JOB_NOT_FOUND: 'Job application not found.',
  REMINDER_SET: 'Reminder set successfully.',
  REMINDER_CANCELLED: 'Reminder cancelled successfully.',
} as const;

export type Message = (typeof MSG)[keyof typeof MSG];
