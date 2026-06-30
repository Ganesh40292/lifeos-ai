import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  GraduationCap,
  Wallet,
  Briefcase,
  StickyNote,
  HeartPulse,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Hourglass,
  Network,
} from 'lucide-react';
import clsx from 'clsx';
import { STORAGE_KEYS, NAV_ITEMS } from '@/utils/constants';

const iconMap = {
  LayoutDashboard,
  GraduationCap,
  Wallet,
  Briefcase,
  StickyNote,
  HeartPulse,
  Settings,
  Hourglass,
  Network,
};

/**
 * Collapsible sidebar navigation with module icons, active state, and smooth transitions.
 */
const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const location = useLocation();

  const toggleCollapse = () => setCollapsed(!collapsed);

  return (
    <aside
      className={clsx(
        'fixed top-0 left-0 z-30 h-screen',
        'bg-bg-card/80 backdrop-blur-md border-r border-border',
        'flex flex-col',
        'transition-all duration-[var(--transition-slow)]',
        // Desktop width configuration
        collapsed ? 'lg:w-[var(--sidebar-collapsed)]' : 'lg:w-[var(--sidebar-width)]',
        // Mobile drawer width and positioning
        'w-[var(--sidebar-width)]',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
    >
      {/* Logo */}
      <motion.div
        initial={{ x: -25, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 24, stiffness: 140, delay: 0.1 }}
        className="flex items-center h-[var(--topbar-height)] px-4 border-b border-border flex-shrink-0"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <AnimatePresence>
            {(!collapsed || mobileOpen) && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-base font-bold text-text whitespace-nowrap overflow-hidden"
              >
                LifeOS
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Navigation */}
      <motion.nav
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 24, stiffness: 130, delay: 0.2 }}
        id="sidebar-nav-container"
        className="flex-1 overflow-y-auto py-4 px-3 space-y-1"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={clsx(
                'group flex items-center gap-3 px-3 py-2.5 rounded-lg',
                'transition-all duration-[var(--transition-fast)]',
                'relative overflow-hidden',
                isActive
                  ? 'bg-primary-muted text-primary'
                  : 'text-text-muted hover:bg-bg-hover hover:text-text'
              )}
              title={collapsed && !mobileOpen ? item.label : undefined}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              <Icon className="w-5 h-5 flex-shrink-0" />

              <AnimatePresence>
                {(!collapsed || mobileOpen) && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm font-medium whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </motion.nav>

      {/* Collapse toggle (desktop only) */}
      <div className="p-3 border-t border-border flex-shrink-0 hidden lg:block">
        <button
          onClick={toggleCollapse}
          className={clsx(
            'w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg',
            'text-text-faint hover:text-text hover:bg-bg-hover',
            'transition-all duration-[var(--transition-fast)]',
            'cursor-pointer'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
