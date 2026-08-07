import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, LayoutDashboard, GraduationCap, Wallet, Hourglass,
  StickyNote, HeartPulse, Settings, Plus, CornerDownLeft, Network,
  Palette, Shield, FileText, Activity, Sun, Moon, LifeBuoy
} from 'lucide-react';
import { APP_NAME } from '@/utils/constants';
import { useTheme } from '@/context/ThemeProvider';

const ALL_ACTIONS = [
  // Navigation
  { id: 'nav-dashboard', label: 'Go to Dashboard', section: 'Navigation', icon: LayoutDashboard, path: '/' },
  { id: 'nav-student', label: 'Go to Student Hub', section: 'Navigation', icon: GraduationCap, path: '/student' },
  { id: 'nav-finance', label: 'Go to Finance Manager', section: 'Navigation', icon: Wallet, path: '/finance' },
  { id: 'nav-notes', label: 'Go to Study Notes & AI', section: 'Navigation', icon: StickyNote, path: '/notes' },
  { id: 'nav-focus', label: 'Go to 3D Focus Room', section: 'Navigation', icon: Hourglass, path: '/focus' },
  { id: 'nav-health', label: 'Go to Health & Workout Tracker', section: 'Navigation', icon: HeartPulse, path: '/health' },
  { id: 'nav-help', label: 'Go to Help & Support Center', section: 'Navigation', icon: LifeBuoy, path: '/help' },
  { id: 'nav-settings', label: 'Go to Settings & Preferences', section: 'Navigation', icon: Settings, path: '/settings' },
  // Quick Actions
  { id: 'act-add-note', label: 'Create New Study Note', section: 'Quick Actions', icon: Plus, path: '/notes' },
  { id: 'act-add-expense', label: 'Log Financial Transaction', section: 'Quick Actions', icon: Plus, path: '/finance' },
  { id: 'act-start-focus', label: 'Start 25-Min Pomodoro Sprint', section: 'Quick Actions', icon: Hourglass, path: '/focus' },
  { id: 'act-log-workout', label: 'Record Workout Entry', section: 'Quick Actions', icon: Activity, path: '/health' },
  { id: 'act-add-assignment', label: 'Add Academic Assignment', section: 'Quick Actions', icon: FileText, path: '/student' },
  // Themes & Customization
  { id: 'theme-midnight', label: 'Switch to Midnight Theme', section: 'Theme Presets', icon: Palette, themeId: 'midnight' },
  { id: 'theme-aurora', label: 'Switch to Aurora Theme', section: 'Theme Presets', icon: Palette, themeId: 'aurora' },
  { id: 'theme-graphite', label: 'Switch to Graphite OLED Theme', section: 'Theme Presets', icon: Palette, themeId: 'graphite' },
  { id: 'theme-ocean', label: 'Switch to Ocean Theme', section: 'Theme Presets', icon: Palette, themeId: 'ocean' },
  { id: 'theme-forest', label: 'Switch to Forest Theme', section: 'Theme Presets', icon: Palette, themeId: 'forest' },
  { id: 'theme-light', label: 'Switch to Light Theme', section: 'Theme Presets', icon: Sun, themeId: 'light' },
  // Settings & Security
  { id: 'set-sessions', label: 'Manage Active Device Sessions', section: 'Settings', icon: Shield, path: '/settings' },
  { id: 'set-shortcuts', label: 'View Keyboard Shortcuts', section: 'Settings', icon: Settings, path: '/settings' },
];

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();
  const { setThemeId } = useTheme();

  const filtered = useMemo(() => {
    if (!query.trim()) return ALL_ACTIONS;
    const q = query.toLowerCase();
    return ALL_ACTIONS.filter(
      (a) => a.label.toLowerCase().includes(q) || a.section.toLowerCase().includes(q)
    );
  }, [query]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((item) => {
      if (!map[item.section]) map[item.section] = [];
      map[item.section].push(item);
    });
    return map;
  }, [filtered]);

  const flatList = useMemo(() => filtered, [filtered]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const executeAction = (item) => {
    onClose();
    if (item.themeId) {
      setThemeId(item.themeId);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, flatList.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatList[selectedIndex]) executeAction(flatList[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  let globalIndex = -1;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -16 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[101] w-[92vw] max-w-[620px]"
          >
            <div className="bg-bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-bg-elevated/50">
                <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Search ${APP_NAME} pages, commands, or themes...`}
                  className="flex-1 bg-transparent text-text text-sm placeholder-text-faint outline-none"
                  autoComplete="off"
                  spellCheck="false"
                />
                <kbd className="hidden sm:flex items-center px-2 py-0.5 text-[10px] text-text-faint bg-bg-card border border-border rounded font-mono">
                  ESC
                </kbd>
              </div>

              <div ref={listRef} className="max-h-[340px] overflow-y-auto py-2">
                {flatList.length === 0 ? (
                  <div className="px-5 py-8 text-center text-xs text-text-muted">
                    No matching results found for "{query}"
                  </div>
                ) : (
                  Object.entries(grouped).map(([section, items]) => (
                    <div key={section}>
                      <div className="px-4 pt-2.5 pb-1 text-[10px] font-bold text-text-faint uppercase tracking-wider">
                        {section}
                      </div>
                      {items.map((item) => {
                        globalIndex++;
                        const idx = globalIndex;
                        const Icon = item.icon;
                        const isSelected = idx === selectedIndex;
                        return (
                          <button
                            key={item.id}
                            data-index={idx}
                            onClick={() => executeAction(item)}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors cursor-pointer ${
                              isSelected ? 'bg-primary-muted text-primary font-medium' : 'text-text-secondary hover:bg-bg-hover'
                            }`}
                          >
                            <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-primary' : 'text-text-muted'}`} />
                            <span className="flex-1 text-xs truncate">{item.label}</span>
                            {isSelected && (
                              <CornerDownLeft className="w-3.5 h-3.5 text-primary opacity-80" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-bg-elevated/40 text-[10px] text-text-faint">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-bg-card border border-border rounded font-mono">↑↓</kbd> Navigate</span>
                  <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-bg-card border border-border rounded font-mono">↵</kbd> Select</span>
                </div>
                <span className="font-semibold text-primary">{APP_NAME} Palette</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
