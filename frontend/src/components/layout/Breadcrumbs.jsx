import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeNameMap = {
  '': 'Dashboard',
  'student': 'Student Hub',
  'finance': 'Finance Manager',
  'notes': 'Study Notes',
  'focus': 'Focus Room',
  'health': 'Health & Fitness',
  'help': 'Help & Support',
  'settings': 'Settings',
};

const Breadcrumbs = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-text-muted">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-text transition-colors p-1 rounded-md hover:bg-bg-hover"
        title="Dashboard"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>

      {pathSegments.length > 0 && <ChevronRight className="w-3 h-3 text-text-faint flex-shrink-0" />}

      {pathSegments.map((segment, index) => {
        const url = `/${pathSegments.slice(0, index + 1).join('/')}`;
        const isLast = index === pathSegments.length - 1;
        const name = routeNameMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

        return (
          <div key={url} className="flex items-center gap-1.5">
            {isLast ? (
              <span className="font-medium text-text px-1.5 py-0.5 rounded bg-bg-hover/50">
                {name}
              </span>
            ) : (
              <Link to={url} className="hover:text-text transition-colors p-1 rounded-md hover:bg-bg-hover">
                {name}
              </Link>
            )}
            {!isLast && <ChevronRight className="w-3 h-3 text-text-faint flex-shrink-0" />}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
