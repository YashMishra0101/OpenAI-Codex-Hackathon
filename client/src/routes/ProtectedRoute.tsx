import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

/**
 * Authentication guard for protected routes.
 *
 * Renders child routes via <Outlet /> when authenticated.
 * Redirects to /login with replace=true when unauthenticated,
 * so pressing "back" after login doesn't return to the login page.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
