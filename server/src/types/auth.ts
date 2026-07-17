/**
 * JWT token payload contracts.
 * Typed payloads prevent accidentally putting the wrong data in a token
 * and make decoder output predictable across the codebase.
 */
export interface AccessTokenPayload {
  userId: string;
  email: string;
  /** Discriminator — ensures access tokens cannot be used as refresh tokens */
  type: 'access';
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string;
  /** Discriminator — ensures refresh tokens cannot be used as access tokens */
  type: 'refresh';
  iat?: number;
  exp?: number;
}

/**
 * The safe subset of user data returned to the client after auth.
 * Never includes password, tokens, or any select:false fields.
 */
export interface SafeUser {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  isVerified: boolean;
  authProvider: 'email' | 'google';
}

/**
 * Context passed from controller to service for structured auth logging.
 * Contains request metadata — never the sensitive payload.
 */
export interface AuthContext {
  ip: string;
  userAgent: string;
}
