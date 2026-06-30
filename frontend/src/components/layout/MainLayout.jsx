import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import BottomNav from './BottomNav';
import CommandPalette from '@/components/ui/CommandPalette';
import ShortcutHelp from '@/components/ui/ShortcutHelp';
import OnboardingTour from '@/components/ui/OnboardingTour';
import { STORAGE_KEYS } from '@/utils/constants';
import ThreeDBackground from '@/components/ui/ThreeDBackground';

/**
 * Main application layout combining Sidebar + Topbar + content area.
 * The content area shifts responsively based on viewport and sidebar state.
 */
const MainLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Sync collapsed state to localStorage
  const handleToggleCollapsed = (val) => {
    setSidebarCollapsed(val);
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, val);
  };

  // Close mobile drawer on resize to desktop view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [shortcutHelpOpen, setShortcutHelpOpen] = useState(false);
  const navigate = useNavigate();

  // Global keyboard shortcut engine
  useEffect(() => {
    let keyBuffer = '';
    let bufferTimeout;

    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an editable field
      const activeElement = document.activeElement;
      const isEditable = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        activeElement.isContentEditable
      );

      // Allow Ctrl+K to toggle even when focused on search/input
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
        return;
      }

      if (isEditable) return;

      // Handle '?' to open help modal
      if (e.key === '?') {
        e.preventDefault();
        setShortcutHelpOpen((prev) => !prev);
        return;
      }

      // Track key sequences
      const key = e.key.toLowerCase();
      
      // We only track alphabetic sequences
      if (/^[a-z]$/.test(key)) {
        clearTimeout(bufferTimeout);
        keyBuffer = (keyBuffer + key).slice(-2);
        
        // Check for navigation sequences
        const sequences = {
          gd: '/',
          gn: '/notes',
          gf: '/finance',
          gs: '/student',
          gh: '/health',
          ge: '/settings',
          gp: '/focus',
        };

        if (sequences[keyBuffer]) {
          e.preventDefault();
          navigate(sequences[keyBuffer]);
          keyBuffer = '';
          return;
        }

        // Set timeout to clear buffer after 800ms of inactivity
        bufferTimeout = setTimeout(() => {
          keyBuffer = '';
        }, 800);
      }

      // Single-key actions when not typing
      if (key === 'n') {
        e.preventDefault();
        navigate('/notes');
      } else if (key === 't') {
        e.preventDefault();
        navigate('/finance');
      } else if (key === 'a') {
        e.preventDefault();
        navigate('/student');
      } else if (key === 'w') {
        e.preventDefault();
        navigate('/health');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(bufferTimeout);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-bg text-text flex relative overflow-hidden">
      {/* Dynamic Ambient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {/* Live Interactive 3D Mesh Wave */}
        <ThreeDBackground />
        
        {/* Soft Glowing Drifting Orbs */}
        <div className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full bg-gradient-to-br from-primary/8 to-transparent blur-[130px] animate-orb-1 opacity-70" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-gradient-to-br from-accent/6 to-transparent blur-[125px] animate-orb-2 opacity-80" />
        <div className="absolute top-[25%] left-[20%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-gradient-to-br from-primary-light/4 to-transparent blur-[110px] animate-orb-3 opacity-60" />
      </div>

      {/* Sidebar - handles collapsed state on desktop & drawer state on mobile */}
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={handleToggleCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Backdrop overlay for mobile drawer */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Main Content Area */}
      <div
        className={clsx(
          'flex-1 min-h-screen flex flex-col relative z-10',
          'transition-all duration-[var(--transition-slow)]',
          sidebarCollapsed
            ? 'lg:ml-[var(--sidebar-collapsed)]'
            : 'lg:ml-[var(--sidebar-width)]',
          'ml-0'
        )}
      >
        <Topbar toggleMobileOpen={() => setMobileOpen((prev) => !prev)} />
        <main className="flex-1 overflow-x-hidden pb-16 lg:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Keyboard Shortcut Help */}
      <ShortcutHelp
        isOpen={shortcutHelpOpen}
        onClose={() => setShortcutHelpOpen(false)}
      />

      {/* Interactive Onboarding Tour */}
      <OnboardingTour />
    </div>
  );
};

export default MainLayout;
