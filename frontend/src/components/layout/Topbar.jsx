import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, LogOut, User, Settings, ChevronDown, Menu, Zap, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import NotificationBell from '@/components/notifications/NotificationBell';
import clsx from 'clsx';
import Avatar from '@/components/ui/Avatar';
import XPBar from '@/components/gamification/XPBar';
import VoiceButton from '@/components/ui/VoiceButton';
import { useAuth } from '@/hooks/useAuth';
import useClickOutside from '@/hooks/useClickOutside';
import { NAV_ITEMS } from '@/utils/constants';
import { useTheme } from '@/context/ThemeProvider';

/**
 * Top navigation bar with page title, search, notifications, and user menu.
 */
const Topbar = ({ toggleMobileOpen }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const userMenuRef = useRef(null);
  const { user, logout } = useAuth();
  const { isLightMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  useClickOutside(userMenuRef, () => setUserMenuOpen(false));

  // Derive current page title from route
  const currentPage =
    NAV_ITEMS.find((item) =>
      item.path === '/'
        ? location.pathname === '/'
        : location.pathname.startsWith(item.path)
    )?.label || 'LifeOS';

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 24, stiffness: 140, delay: 0.15 }}
      className={clsx(
        'h-[var(--topbar-height)] border-b border-border bg-bg-card/80 backdrop-blur-md',
        'flex items-center justify-between px-6',
        'sticky top-0 z-20'
      )}
    >
      {/* Left — Hamburger + Logo (on Mobile) + Page title (on Desktop) */}
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={toggleMobileOpen}
          className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-bg-hover lg:hidden cursor-pointer"
          aria-label="Toggle mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Logo shown on mobile drawer closed state */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-text">LifeOS</span>
        </div>

        {/* Vertical divider on mobile */}
        <span className="h-4 w-px bg-border lg:hidden" />

        <h1 className="text-base font-semibold text-text truncate max-w-[150px] sm:max-w-none">
          {currentPage}
        </h1>
      </div>

      {/* Right — Search, Notifications, User Menu */}
      <div className="flex items-center gap-3">
        <XPBar user={user} />
        {/* Search */}
        <div
          className={clsx(
            'hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border bg-bg-input',
            'transition-all duration-[var(--transition-fast)]',
            searchFocused
              ? 'border-primary ring-2 ring-ring w-64'
              : 'border-border w-52'
          )}
        >
          <Search className="w-4 h-4 text-text-faint flex-shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-text placeholder:text-text-faint outline-none w-full"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <kbd className="hidden lg:inline-flex px-1.5 py-0.5 text-[10px] text-text-faint bg-bg-elevated border border-border rounded font-mono">
            ⌘K
          </kbd>
        </div>

        {/* Notifications */}
        <NotificationBell />

        {/* Voice Command Button */}
        <VoiceButton />

        {/* Theme Toggle */}
        <button
          id="theme-toggle-btn"
          onClick={toggleTheme}
          className={clsx(
            'p-2 rounded-lg',
            'text-text-muted hover:text-text hover:bg-bg-hover',
            'transition-colors duration-[var(--transition-fast)]',
            'cursor-pointer'
          )}
          aria-label="Toggle Theme"
        >
          {!isLightMode ? <Sun className="w-5 h-5 text-warning" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className={clsx(
              'flex items-center gap-2 px-2 py-1.5 rounded-lg',
              'hover:bg-bg-hover transition-colors duration-[var(--transition-fast)]',
              'cursor-pointer'
            )}
          >
            <Avatar name={user?.fullName} size="sm" />
            <span className="hidden sm:block text-sm font-medium text-text-secondary max-w-[120px] truncate">
              {user?.fullName || 'User'}
            </span>
            <ChevronDown
              className={clsx(
                'w-3.5 h-3.5 text-text-faint transition-transform duration-150',
                userMenuOpen && 'rotate-180'
              )}
            />
          </button>

          {/* Dropdown */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 py-1 rounded-xl border border-border bg-bg-card shadow-lg animate-[fade-in_0.15s_ease-out]">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-sm font-medium text-text truncate">
                  {user?.fullName}
                </p>
                <p className="text-xs text-text-faint truncate">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate('/settings');
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-muted hover:bg-bg-hover hover:text-text transition-colors cursor-pointer"
              >
                <User className="w-4 h-4" />
                Profile
              </button>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate('/settings');
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-muted hover:bg-bg-hover hover:text-text transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  logout();
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-danger hover:bg-danger-muted transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Topbar;
