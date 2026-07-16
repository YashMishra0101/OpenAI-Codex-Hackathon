import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage })));
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })));

/**
 * Application router — React Router v7 in library mode (pure client-side SPA).
 */
export const router = createBrowserRouter([
  // ── Public routes ─────────────────────────────────────────────────────────
  {
    path: '/',
    element: (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <h1 className="text-3xl font-bold">AI Resume Checker &amp; Job Tracker</h1>
          <p className="mt-2 text-muted-foreground">Landing Page — Phase 5</p>
        </div>
      </div>
    ),
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><LoadingSpinner /></div>}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/register',
    element: (
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><LoadingSpinner /></div>}>
        <RegisterPage />
      </Suspense>
    ),
  },
  {
    path: '/signup',
    element: (
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><LoadingSpinner /></div>}>
        <RegisterPage />
      </Suspense>
    ),
  },
  {
    path: '/verify-email',
    element: (
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><LoadingSpinner /></div>}>
        <VerifyEmailPage />
      </Suspense>
    ),
  },

  // ── Protected routes — requires authentication ────────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        element: (
          <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
            <p className="text-muted-foreground">Dashboard — Phase 5</p>
          </div>
        ),
      },
      {
        path: '/dashboard/resume-checker',
        element: (
          <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
            <p className="text-muted-foreground">Resume Checker — Phase 10</p>
          </div>
        ),
      },
      {
        path: '/dashboard/jobs',
        element: (
          <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
            <p className="text-muted-foreground">Job Tracker — Phase 14</p>
          </div>
        ),
      },
      {
        path: 'profile',
        element: (
          <Suspense fallback={<div className="flex h-full items-center justify-center"><LoadingSpinner /></div>}>
            <ProfilePage />
          </Suspense>
        ),
      },
    ],
  },
]);
