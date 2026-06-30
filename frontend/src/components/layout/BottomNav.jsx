import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, GraduationCap, Wallet, StickyNote, HeartPulse } from 'lucide-react';
import clsx from 'clsx';

const BOTTOM_NAV_ITEMS = [
  { label: 'Home', path: '/', icon: LayoutDashboard },
  { label: 'Academics', path: '/student', icon: GraduationCap },
  { label: 'Finance', path: '/finance', icon: Wallet },
  { label: 'Notes', path: '/notes', icon: StickyNote },
  { label: 'Health', path: '/health', icon: HeartPulse },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-bg-card/85 backdrop-blur-md border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.3)] px-2 py-1.5 pb-safe">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all duration-200 min-w-[64px]',
                  isActive
                    ? 'text-primary bg-primary-muted font-semibold'
                    : 'text-text-muted hover:text-text hover:bg-bg-hover/50'
                )
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
