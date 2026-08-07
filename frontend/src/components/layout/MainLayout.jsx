import { useState, useEffect, lazy, Suspense } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileBottomNav from './MobileBottomNav';
import { STORAGE_KEYS } from '@/utils/constants';

// Lazy-loaded non-critical modal overlays & background mesh
const CommandPalette = lazy(() => import('@/components/ui/CommandPalette'));
const ShortcutHelp = lazy(() => import('@/components/ui/ShortcutHelp'));
const OnboardingTour = lazy(() => import('@/components/ui/OnboardingTour'));
const AuroraBackground = lazy(() => import('@/components/ui/AuroraBackground'));
const AiCopilot = lazy(() => import('@/components/ui/AiCopilot'));
const PwaBanner = lazy(() => import('@/components/ui/PwaBanner'));

/**
 * Main application layout combining Sidebar + Topbar + content area.
 */
const MainLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutHelpOpen, setShortcutHelpOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const navigate = useNavigate();

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

      // Allow Ctrl+Shift+A to toggle AI Copilot
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setCopilotOpen((prev) => !prev);
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
          gh: '/help',
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
    <div className="min-h-screen bg-[#020617] text-text flex relative overflow-hidden">
      {/* Ambient Enterprise SaaS Aurora Background */}
      <Suspense fallback={null}>
        <AuroraBackground
          gradientColors={[
            "rgba(99,102,241,0.18)",
            "rgba(139,92,246,0.14)"
          ]}
          pulseDuration={18}
          starCount={25}
        />
      </Suspense>

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
        <Topbar
          toggleMobileOpen={() => setMobileOpen((prev) => !prev)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenCopilot={() => setCopilotOpen(true)}
        />
        <main className="flex-1 overflow-x-hidden pb-16 lg:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Floating AI Copilot Trigger Button */}
      <button
        onClick={() => setCopilotOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary-light text-white flex items-center justify-center shadow-xl shadow-primary/30 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20"
        title="Open AI Copilot (Ctrl + Shift + A)"
      >
        <span className="text-xl">✨</span>
      </button>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* PWA & Offline Banner */}
      <Suspense fallback={null}>
        <PwaBanner />
      </Suspense>

      {/* Lazy-loaded overlays */}
      <Suspense fallback={null}>
        {commandPaletteOpen && (
          <CommandPalette
            isOpen={commandPaletteOpen}
            onClose={() => setCommandPaletteOpen(false)}
          />
        )}
        {shortcutHelpOpen && (
          <ShortcutHelp
            isOpen={shortcutHelpOpen}
            onClose={() => setShortcutHelpOpen(false)}
          />
        )}
        {copilotOpen && (
          <AiCopilot
            isOpen={copilotOpen}
            onClose={() => setCopilotOpen(false)}
          />
        )}
        <OnboardingTour />
      </Suspense>
    </div>
  );
};

export default MainLayout;
