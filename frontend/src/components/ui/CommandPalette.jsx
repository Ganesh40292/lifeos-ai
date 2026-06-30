import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, LayoutDashboard, GraduationCap, Wallet, Hourglass,
  StickyNote, HeartPulse, Settings, Plus, ArrowRight,
  Command, CornerDownLeft, Network
} from 'lucide-react';

const ALL_ACTIONS = [
  // Navigation
  { id: 'nav-dashboard', label: 'Go to Dashboard', section: 'Navigation', icon: LayoutDashboard, action: 'navigate', path: '/' },
  { id: 'nav-student', label: 'Go to Student', section: 'Navigation', icon: GraduationCap, action: 'navigate', path: '/student' },
  { id: 'nav-finance', label: 'Go to Finance', section: 'Navigation', icon: Wallet, action: 'navigate', path: '/finance' },
  { id: 'nav-notes', label: 'Go to Notes', section: 'Navigation', icon: StickyNote, action: 'navigate', path: '/notes' },
  { id: 'nav-focus', label: 'Go to Focus Room', section: 'Navigation', icon: Hourglass, action: 'navigate', path: '/focus' },
  { id: 'nav-health', label: 'Go to Health', section: 'Navigation', icon: HeartPulse, action: 'navigate', path: '/health' },
  { id: 'nav-skills', label: 'Go to Skill Tree', section: 'Navigation', icon: Network, action: 'navigate', path: '/skills' },
  { id: 'nav-settings', label: 'Go to Settings', section: 'Navigation', icon: Settings, action: 'navigate', path: '/settings' },
  // Quick Actions
  { id: 'act-add-expense', label: 'Add Expense', section: 'Quick Actions', icon: Plus, action: 'navigate', path: '/finance' },
  { id: 'act-add-note', label: 'Create New Note', section: 'Quick Actions', icon: Plus, action: 'navigate', path: '/notes' },
  { id: 'act-log-workout', label: 'Log Workout', section: 'Quick Actions', icon: Plus, action: 'navigate', path: '/health' },
  { id: 'act-add-subject', label: 'Add Subject', section: 'Quick Actions', icon: Plus, action: 'navigate', path: '/student' },
  // Settings
  { id: 'set-profile', label: 'Edit Profile', section: 'Settings', icon: Settings, action: 'navigate', path: '/settings' },
  { id: 'set-password', label: 'Change Password', section: 'Settings', icon: Settings, action: 'navigate', path: '/settings' },
  { id: 'set-theme', label: 'Change Theme', section: 'Settings', icon: Settings, action: 'navigate', path: '/settings' },
];

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    if (!query.trim()) return ALL_ACTIONS;
    const q = query.toLowerCase();
    return ALL_ACTIONS.filter(
      (a) => a.label.toLowerCase().includes(q) || a.section.toLowerCase().includes(q)
    );
  }, [query]);

  // Group by section
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((item) => {
      if (!map[item.section]) map[item.section] = [];
      map[item.section].push(item);
    });
    return map;
  }, [filtered]);

  // Flat list for keyboard nav
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

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const executeAction = (item) => {
    onClose();
    if (item.action === 'navigate') {
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[101] w-[95vw] max-w-[640px]"
          >
            <div className="bg-[#1a1a1f] border border-gray-700/60 rounded-2xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-700/40">
                <Search className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 outline-none"
                  autoComplete="off"
                  spellCheck="false"
                />
                <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-[10px] text-gray-500 bg-gray-800 border border-gray-700 rounded-md font-mono">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-[360px] overflow-y-auto py-2">
                {flatList.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-gray-500">
                    No results found for "{query}"
                  </div>
                ) : (
                  Object.entries(grouped).map(([section, items]) => (
                    <div key={section}>
                      <div className="px-5 pt-3 pb-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
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
                            className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                              isSelected ? 'bg-blue-600/15 text-blue-400' : 'text-gray-300 hover:bg-gray-800/50'
                            }`}
                          >
                            <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-blue-400' : 'text-gray-500'}`} />
                            <span className="flex-1 text-sm truncate">{item.label}</span>
                            {isSelected && (
                              <CornerDownLeft className="w-3.5 h-3.5 text-gray-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-2.5 border-t border-gray-700/40 text-[11px] text-gray-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-[10px] font-mono">↑↓</kbd> Navigate</span>
                  <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-[10px] font-mono">↵</kbd> Select</span>
                  <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-[10px] font-mono">Esc</kbd> Close</span>
                </div>
                <span className="flex items-center gap-1">
                  <Command className="w-3 h-3" /> LifeOS
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
