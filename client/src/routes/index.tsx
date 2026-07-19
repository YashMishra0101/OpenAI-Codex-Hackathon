import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage })));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));
const TermsOfServicePage = lazy(() => import('@/pages/legal/TermsOfServicePage').then((m) => ({ default: m.TermsOfServicePage })));
const PrivacyPolicyPage = lazy(() => import('@/pages/legal/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage })));
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
  // ── Main Layout Routes ───────────────────────────────────────────────────
  {
    element: <MainLayout />,
    children: [
      // ── Auth routes (Public only) ─────────────────────────────────────────────
      {
        element: <PublicRoute />,
        children: [
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
          {
            path: '/forgot-password',
            element: (
              <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><LoadingSpinner /></div>}>
                <ForgotPasswordPage />
              </Suspense>
            ),
          },
          {
            path: '/reset-password',
            element: (
              <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><LoadingSpinner /></div>}>
                <ResetPasswordPage />
              </Suspense>
            ),
          },
        ]
      },

      // Neutral pages (Accessible to both logged in and logged out users)
      {
        path: '/',
        element: (
          <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><LoadingSpinner /></div>}>
            <LandingPage />
          </Suspense>
        ),
      },
      {
        path: '/terms',
        element: (
          <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><LoadingSpinner /></div>}>
            <TermsOfServicePage />
          </Suspense>
        ),
      },
      {
        path: '/privacy',
        element: (
          <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><LoadingSpinner /></div>}>
            <PrivacyPolicyPage />
          </Suspense>
        ),
      },

      // Protected routes (Requires authentication)
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              {
                path: '/dashboard',
                element: <Navigate to="/analyzer" replace />,
              },
              {
                path: '/dashboard/resume-analyzer',
                element: (
                  <Suspense fallback={<div className="flex h-full items-center justify-center"><LoadingSpinner /></div>}>
                    <AnalyzerHistoryPage />
                  </Suspense>
                ),
              },
              {
                path: '/dashboard/jobs',
                element: <Navigate to="/jobs" replace />,
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
    ],
  },
]);
