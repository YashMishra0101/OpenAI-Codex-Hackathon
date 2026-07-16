import { OAuth2Client } from 'google-auth-library';
import { env } from './env.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP } from '../constants/httpStatus.js';
import { MSG } from '../constants/messages.js';

/**
 * Google OAuth2 client for server-side ID token verification.
 *
 * Why google-auth-library over passport-google-oauth?
 *   passport-google-oauth manages the full OAuth redirect flow (browser
 *   redirect → Google consent → callback URL). This project uses
 *   @react-oauth/google on the frontend, which handles the browser flow
 *   and returns a credential (ID token) to the React app. The backend's
 *   only job is to verify that the ID token is authentic — google-auth-library
 *   does exactly that with one function call. No Passport, no redirects.
 */

let _googleClient: OAuth2Client | null = null;

function getGoogleClient(): OAuth2Client {
  if (!_googleClient) {
    if (!env.GOOGLE_CLIENT_ID) {
      throw new ApiError(HTTP.SERVICE_UNAVAILABLE, MSG.OAUTH_ERROR);
    }
    _googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);
  }
  return _googleClient;
}

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  profileImage?: string;
}

/**
 * Verifies a Google ID token credential returned by @react-oauth/google
 * and extracts the verified user profile.
 *
 * @throws ApiError(401) if the token is invalid or the payload is missing
 */
export async function verifyGoogleToken(credential: string): Promise<GoogleProfile> {
  const client = getGoogleClient();

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (
    !payload ||
    !payload.sub ||
    !payload.email ||
    !payload.name
  ) {
    throw new ApiError(HTTP.UNAUTHORIZED, MSG.OAUTH_ERROR);
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name,
    profileImage: payload.picture,
  };
}
