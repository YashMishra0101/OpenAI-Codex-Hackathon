import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage })));
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const AnalyzerPage = lazy(() => import('@/pages/analyzer/AnalyzerPage').then((m) => ({ default: m.AnalyzerPage })));
const AnalyzerHistoryPage = lazy(() => import('@/pages/analyzer/AnalyzerHistoryPage').then((m) => ({ default: m.AnalyzerHistoryPage })));
const AnalyzerDetailPage = lazy(() => import('@/pages/analyzer/AnalyzerDetailPage').then((m) => ({ default: m.AnalyzerDetailPage })));
const JobTrackerPage = lazy(() => import('@/pages/jobs/JobTrackerPage').then((m) => ({ default: m.JobTrackerPage })));

const LandingPage = lazy(() => import('@/pages/LandingPage').then((m) => ({ default: m.LandingPage })));

/**
 * Application router — React Router v7 in library mode (pure client-side SPA).
 */
export const router = createBrowserRouter([
  // ── Public routes ─────────────────────────────────────────────────────────
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/',
        element: (
          <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><LoadingSpinner /></div>}>
            <LandingPage />
          </Suspense>
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
    ]
  },

  // ── Protected routes — requires authentication ────────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
      {
        path: '/dashboard',
        element: (
          <Navigate to="/jobs" replace />
        ),
      },
      {
        path: '/dashboard/resume-checker',
        element: (
          <Suspense fallback={<div className="flex h-full items-center justify-center"><LoadingSpinner /></div>}>
            <AnalyzerHistoryPage />
          </Suspense>
        ),
      },
      {
        path: '/dashboard/jobs',
        element: (
          <Navigate to="/jobs" replace />
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
      {
        path: 'analyzer',
        element: (
          <Suspense fallback={<div className="flex h-full items-center justify-center"><LoadingSpinner /></div>}>
            <AnalyzerPage />
          </Suspense>
        ),
      },
      {
        path: 'analyzer/:id',
        element: (
          <Suspense fallback={<div className="flex h-full items-center justify-center"><LoadingSpinner /></div>}>
            <AnalyzerDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'jobs',
        element: (
          <Suspense fallback={<div className="flex h-full items-center justify-center"><LoadingSpinner /></div>}>
            <JobTrackerPage />
          </Suspense>
        ),
      },
        ],
      },
    ],
  },
]);
