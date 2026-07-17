import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

/**
 * Public route guard.
 * 
 * If a user is ALREADY logged in and they try to visit /login or /register,
 * this component automatically redirects them to the main dashboard.
 */
export function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // If they are logged in, send them to the main app
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, let them see the public pages (login, register)
  return <Outlet />;
}
