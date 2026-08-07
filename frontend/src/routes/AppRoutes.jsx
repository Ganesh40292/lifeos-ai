import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import SkeletonCard from '@/components/ui/SkeletonLoader';

// Lazy-loaded pages for code splitting
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const StudentPage = lazy(() => import('@/pages/student/StudentPage'));
const FinancePage = lazy(() => import('@/pages/finance/FinancePage'));
const NotesPage = lazy(() => import('@/pages/notes/NotesPage'));
const HealthPage = lazy(() => import('@/pages/health/HealthPage'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));
const FocusPage = lazy(() => import('@/pages/focus/FocusPage'));


const HelpPage = lazy(() => import('@/pages/help/HelpPage'));

/** Suspense skeleton fallback while lazy-loaded route chunk is fetched */
const PageLoader = () => (
  <div className="page-container space-y-6">
    <div className="h-8 w-64 bg-bg-card rounded-lg skeleton-shimmer" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SkeletonCard count={3} />
    </div>
  </div>
);

/** Wrap a page component with ErrorBoundary and Suspense */
const withSuspense = (Component) => (
  <ErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  </ErrorBoundary>
);

/**
 * Application router configuration.
 * - Auth routes (login, register) are publicly accessible
 * - All other routes require authentication via ProtectedRoute
 * - MainLayout provides sidebar + topbar shell for authenticated pages
 */
const router = createBrowserRouter([
  // Public auth routes
  {
    path: '/login',
    element: withSuspense(LoginPage),
  },
  {
    path: '/register',
    element: withSuspense(RegisterPage),
  },

  // Protected routes within the main layout
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: withSuspense(DashboardPage) },
      { path: 'student', element: withSuspense(StudentPage) },
      { path: 'finance', element: withSuspense(FinancePage) },
      { path: 'notes', element: withSuspense(NotesPage) },
      { path: 'health', element: withSuspense(HealthPage) },
      { path: 'settings', element: withSuspense(SettingsPage) },
      { path: 'focus', element: withSuspense(FocusPage) },
      { path: 'help', element: withSuspense(HelpPage) },

    ],
  },

  // Catch-all — redirect to dashboard
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default router;
