import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';

/**
 * Configured Axios instance for all API communication.
 *
 * Key settings:
 *   baseURL        — reads from VITE_API_URL env var (e.g. https://api.yourapp.com/api/v1)
 *   withCredentials — MANDATORY: tells the browser to attach HttpOnly cookies
 *                     to every cross-origin request. Without this, the backend
 *                     never receives the JWT cookies and every auth request fails.
 *
 * Interceptors:
 *   Response — handles 401 Unauthorized by attempting a silent token refresh
 *              (POST /auth/refresh). If the refresh succeeds, the original
 *              request is retried transparently. If it fails (refresh token
 *              also expired), the user is redirected to /login.
 *
 *   The _retry flag on the request config prevents infinite retry loops when
 *   the /auth/refresh endpoint itself returns 401.
 */
const api = axios.create({
  baseURL: import.meta.env['VITE_API_URL'] as string,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Response interceptor — silent token refresh on 401 ───────────────────────
type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;

    const is401 = error.response?.status === 401;
    const isNotAlreadyRetried = !originalRequest?._retry;
    const isNotRefreshEndpoint = !originalRequest?.url?.includes('/auth/refresh');

    if (is401 && isNotAlreadyRetried && isNotRefreshEndpoint && originalRequest) {
      originalRequest._retry = true;

      try {
        // The refresh token lives in an HttpOnly cookie — sent automatically
        await api.post<unknown>('/auth/refresh');
        // Retry the original request with the new access token (also in a cookie)
        return await api(originalRequest);
      } catch {
        // Refresh failed — session is fully expired, redirect to login if not already there
        const publicPaths = [
          '/',
          '/login',
          '/register',
          '/signup',
          '/verify-email',
          '/forgot-password',
          '/reset-password',
          '/terms',
          '/privacy',
        ];
        
        // If the request that triggered this was the initial session check on app load,
        // we defer to React Router's ProtectedRoute to handle the redirect if necessary.
        // Otherwise, for active API calls that fail with 401, we forcefully redirect.
        if (originalRequest.url !== '/users/me' && !publicPaths.includes(window.location.pathname)) {
          window.location.href = '/login';
        }
        
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
