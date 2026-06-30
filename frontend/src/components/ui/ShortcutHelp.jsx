import { X, Keyboard } from 'lucide-react';
import Modal from '@/components/ui/Modal';

const SHORTCUTS = [
  { keys: ['Ctrl', 'K'], desc: 'Open Command Palette', section: 'General' },
  { keys: ['?'], desc: 'Toggle keyboard shortcut menu', section: 'General' },
  { keys: ['v'], desc: 'Toggle SiriOS Voice assistant', section: 'General' },
  { keys: ['g', 'd'], desc: 'Navigate to Dashboard', section: 'Navigation' },
  { keys: ['g', 'n'], desc: 'Navigate to Notes', section: 'Navigation' },
  { keys: ['g', 'f'], desc: 'Navigate to Finance', section: 'Navigation' },
  { keys: ['g', 's'], desc: 'Navigate to Student', section: 'Navigation' },
  { keys: ['g', 'h'], desc: 'Navigate to Health', section: 'Navigation' },
  { keys: ['g', 'e'], desc: 'Navigate to Settings', section: 'Navigation' },
  { keys: ['g', 'p'], desc: 'Navigate to Focus Room', section: 'Navigation' },
  { keys: ['n'], desc: 'Create a new note', section: 'Quick Actions' },
  { keys: ['t'], desc: 'Create a new finance transaction', section: 'Quick Actions' },
  { keys: ['a'], desc: 'Create a new assignment', section: 'Quick Actions' },
  { keys: ['w'], desc: 'Log a new workout session', section: 'Quick Actions' },
];

const ShortcutHelp = ({ isOpen, onClose }) => {
  // Group by section
  const sections = SHORTCUTS.reduce((acc, current) => {
    if (!acc[current.section]) {
      acc[current.section] = [];
    }
    acc[current.section].push(current);
    return acc;
  }, {});

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" size="md">
      <div className="space-y-6 py-2">
        <div className="flex items-center gap-2 text-text-muted text-xs bg-bg-hover border border-border p-3 rounded-lg">
          <Keyboard className="w-4 h-4 text-primary flex-shrink-0" />
          <span>Pressing key sequences (like <kbd className="px-1 bg-bg-card border border-border rounded text-[10px]">g</kbd> followed by <kbd className="px-1 bg-bg-card border border-border rounded text-[10px]">d</kbd>) lets you navigate instantly around the app.</span>
        </div>

        <div className="space-y-4">
          {Object.entries(sections).map(([sectionName, items]) => (
            <div key={sectionName} className="space-y-2">
              <h4 className="text-[10px] font-bold text-text-faint uppercase tracking-wider">
                {sectionName}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {items.map((item) => (
                  <div key={item.desc} className="flex items-center justify-between py-1.5 border-b border-border/40 text-xs">
                    <span className="text-text-secondary">{item.desc}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, i) => (
                        <span key={key} className="flex items-center gap-1">
                          <kbd className="px-1.5 py-0.5 bg-bg-elevated border border-border-light rounded text-[10px] font-mono text-text font-semibold shadow-sm">
                            {key}
                          </kbd>
                          {i < item.keys.length - 1 && <span className="text-[10px] text-text-faint">+</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default ShortcutHelp;
