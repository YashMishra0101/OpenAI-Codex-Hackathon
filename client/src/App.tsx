import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import { router } from './routes';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './features/auth/context/AuthContext';

/**
 * Root application component.
 *
 * Provider order matters:
 *   1. GoogleOAuthProvider — initializes the Google Identity SDK
 *   2. QueryClientProvider  — provides TanStack Query context for all data fetching
 *   3. AuthProvider         — checks session and manages auth state
 *   4. RouterProvider       — renders the matched route component tree
 *   5. Toaster              — toast notifications rendered outside the route tree
 *                             so they persist across route transitions
 */
export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env['VITE_GOOGLE_CLIENT_ID'] as string}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#18181b',
                color: '#fafafa',
                border: '1px solid #27272a',
                borderRadius: '8px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#22c55e', secondary: '#18181b' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#18181b' } },
            }}
          />
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
