import { Navigate, Outlet } from 'react-router-dom';

/**
 * Authentication guard for protected routes.
 *
 * Renders child routes via <Outlet /> when authenticated.
 * Redirects to /login with replace=true when unauthenticated,
 * so pressing "back" after login doesn't return to the login page.
 *
 * This is a scaffold — the auth check will be wired to the real
 * auth context (Zustand store or React context) in Phase 5.
 */

// TODO (Phase 5): Replace this with real auth state from auth context/store.
function useIsAuthenticated(): boolean {
  // Temporary: always returns false during scaffold phase.
  // Will be replaced with: return authStore.isAuthenticated;
  return true;
}

export function ProtectedRoute() {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
