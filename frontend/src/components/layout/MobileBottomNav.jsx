import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, StickyNote, Hourglass, HeartPulse } from 'lucide-react';
import clsx from 'clsx';

const mobileNavItems = [
  { label: 'Home', path: '/', icon: LayoutDashboard },
  { label: 'Focus', path: '/focus', icon: Hourglass },
  { label: 'Notes', path: '/notes', icon: StickyNote },
  { label: 'Finance', path: '/finance', icon: Wallet },
  { label: 'Health', path: '/health', icon: HeartPulse },
];

const MobileBottomNav = () => {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-card/90 backdrop-blur-lg border-t border-border px-2 py-1.5 flex items-center justify-around">
      {mobileNavItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={clsx(
              'flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors min-w-[56px]',
              isActive ? 'text-primary' : 'text-text-muted hover:text-text'
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium leading-none">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
