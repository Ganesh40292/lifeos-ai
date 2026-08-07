/** Aetheria application constants. */
export const APP_NAME = 'Aetheria';

/** API base URL — dynamic for production deployments with automatic /api suffix formatting */
const rawApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';
export const API_BASE_URL = (rawApiUrl.startsWith('http') && !rawApiUrl.endsWith('/api')) 
  ? `${rawApiUrl.replace(/\/+$/, '')}/api` 
  : rawApiUrl;

/** LocalStorage keys */
export const STORAGE_KEYS = {
  TOKEN: 'aetheria_token',
  USER: 'aetheria_user',
  SIDEBAR_COLLAPSED: 'aetheria_sidebar_collapsed',
  THEME: 'aetheria_theme',
};

/** Navigation items for the sidebar */
export const NAV_ITEMS = [
  {
    label: 'Dashboard',
    path: '/',
    icon: 'LayoutDashboard',
  },
  {
    label: 'Student',
    path: '/student',
    icon: 'GraduationCap',
  },
  {
    label: 'Finance',
    path: '/finance',
    icon: 'Wallet',
  },
  {
    label: 'Notes',
    path: '/notes',
    icon: 'StickyNote',
  },
  {
    label: 'Focus',
    path: '/focus',
    icon: 'Hourglass',
  },
  {
    label: 'Health',
    path: '/health',
    icon: 'HeartPulse',
  },

  {
    label: 'Help & Support',
    path: '/help',
    icon: 'LifeBuoy',
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: 'Settings',
  },
];

/** Badge variant mappings */
export const BADGE_VARIANTS = {
  success: {
    bg: 'bg-success-muted',
    text: 'text-success',
  },
  warning: {
    bg: 'bg-warning-muted',
    text: 'text-warning',
  },
  danger: {
    bg: 'bg-danger-muted',
    text: 'text-danger',
  },
  info: {
    bg: 'bg-info-muted',
    text: 'text-info',
  },
  primary: {
    bg: 'bg-primary-muted',
    text: 'text-primary',
  },
  accent: {
    bg: 'bg-accent-muted',
    text: 'text-accent',
  },
};

/** HTTP status messages */
export const HTTP_MESSAGES = {
  401: 'Your session has expired. Please log in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  500: 'Something went wrong. Please try again later.',
};
