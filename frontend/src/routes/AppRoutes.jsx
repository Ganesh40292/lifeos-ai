import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';

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
const SkillsPage = lazy(() => import('@/pages/skills/SkillsPage'));

/** Suspense fallback shown while lazy-loaded pages are being fetched */
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Loader2 className="w-6 h-6 text-primary animate-spin" />
  </div>
);

/** Wrap a page component with Suspense */
const withSuspense = (Component) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
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
      { path: 'skills', element: withSuspense(SkillsPage) },
    ],
  },

  // Catch-all — redirect to dashboard
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default router;
