import { useState } from 'react';
import { 
  Settings as SettingsIcon, User, Lock, Palette, Command, 
  HardDrive, Download, Check, ShieldCheck, Sparkles, Database,
  ArrowRight, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileSettings from './ProfileSettings';
import SecuritySettings from './SecuritySettings';
import AppearanceSettings from './AppearanceSettings';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { APP_NAME } from '@/utils/constants';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User, description: 'Personal details & email' },
  { id: 'security', label: 'Security & 2FA', icon: Lock, description: 'Password & authentication' },
  { id: 'appearance', label: 'Theme & Appearance', icon: Palette, description: 'Visual palettes & styling' },
  { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Command, description: 'Global hotkey bindings' },
  { id: 'data', label: 'Account Data & Storage', icon: HardDrive, description: 'Backups & storage allocation' },
];

const SHORTCUTS = [
  { key: '⌘ K / Ctrl + K', action: 'Open Universal Command Palette', category: 'Navigation' },
  { key: 'V', action: 'Activate Voice Commander', category: 'Actions' },
  { key: 'g then d', action: 'Navigate to Dashboard', category: 'Navigation' },
  { key: 'g then n', action: 'Navigate to Study Notes', category: 'Navigation' },
  { key: 'g then f', action: 'Navigate to Finance Manager', category: 'Navigation' },
  { key: 'g then s', action: 'Navigate to Student Hub', category: 'Navigation' },
  { key: 'g then h', action: 'Navigate to Help & Support Center', category: 'Navigation' },
  { key: 'g then p', action: 'Navigate to 3D Focus Room', category: 'Navigation' },
  { key: 'g then e', action: 'Navigate to Settings', category: 'Navigation' },
  { key: 'Esc', action: 'Close open modal dialogs & overlays', category: 'Global' },
];

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [shortcutFilter, setShortcutFilter] = useState('ALL');
  const [exported, setExported] = useState(false);

  const userInitials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'US';

  const handleExportAccountData = () => {
    const data = {
      app: APP_NAME,
      exportedAt: new Date().toISOString(),
      user: {
        id: user?.id,
        fullName: user?.fullName,
        email: user?.email,
        level: user?.level,
        xp: user?.xp
      },
      theme: localStorage.getItem('aetheria_theme_id') || 'midnight',
      currency: localStorage.getItem('aetheria_currency') || 'USD',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${APP_NAME}_account_backup.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  const filteredShortcuts = SHORTCUTS.filter(s => 
    shortcutFilter === 'ALL' || s.category.toUpperCase() === shortcutFilter
  );

  return (
    <div className="page-container max-w-6xl mx-auto space-y-8">
      {/* 
        -------------------------------------------------------------
        SETTINGS HERO BANNER & USER PROFILE SUMMARY
        -------------------------------------------------------------
      */}
      <Card className="p-6 sm:p-8 bg-gradient-to-r from-primary/15 via-bg-card/80 to-bg-card/90 border border-primary/30 rounded-2xl shadow-xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-primary-light to-accent flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-primary/20 border border-white/20">
              {userInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-text tracking-tight">
                  {user?.fullName || 'Aetheria User'}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-primary">
                  Level {user?.level || 1}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-1">{user?.email || 'user@aetheria.dev'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-bg-card/60 p-3 rounded-xl border border-border/60 backdrop-blur-md">
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-text-muted">Account Status</span>
              <span className="text-xs font-bold text-success flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified SaaS Workspace
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 
        -------------------------------------------------------------
        MAIN SETTINGS NAVIGATION & TAB CONTENT GRID
        -------------------------------------------------------------
      */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Sidebar Navigation */}
        <Card className="w-full lg:w-72 p-3 bg-bg-card/75 backdrop-blur-xl border border-border/80 rounded-2xl shadow-lg shrink-0">
          <nav className="flex flex-col space-y-1.5">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-between p-3 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/25 font-bold'
                      : 'text-text-muted hover:bg-bg-elevated hover:text-text'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isActive ? 'bg-white/20 text-white' : 'bg-bg-elevated border border-border/60 text-text-faint'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold block">{tab.label}</span>
                      <span className={`text-[10px] block ${isActive ? 'text-white/80' : 'text-text-faint'}`}>
                        {tab.description}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </Card>

        {/* Right Tab Content Panel */}
        <div className="flex-1 w-full min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === 'profile' && <ProfileSettings />}
              {activeTab === 'security' && <SecuritySettings />}
              {activeTab === 'appearance' && <AppearanceSettings />}
              
              {/* Keyboard Shortcuts Tab */}
              {activeTab === 'shortcuts' && (
                <Card className="p-7 bg-bg-card/75 backdrop-blur-xl border border-border/80 rounded-2xl shadow-xl space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-text flex items-center gap-2">
                        <Command className="w-5 h-5 text-primary" />
                        Global Hotkeys & Navigation Shortcuts
                      </h2>
                      <p className="text-xs text-text-muted mt-1">
                        Accelerate your productivity workflow with instant keybindings.
                      </p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1 bg-bg-elevated/60 p-1 rounded-xl border border-border/60">
                      {['ALL', 'NAVIGATION', 'ACTIONS', 'GLOBAL'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setShortcutFilter(cat)}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase transition-all cursor-pointer ${
                            shortcutFilter === cat
                              ? 'bg-primary text-white shadow-sm'
                              : 'text-text-muted hover:text-text'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="divide-y divide-border/50">
                    {filteredShortcuts.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between py-3 hover:bg-bg-elevated/30 px-2 rounded-lg transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                            {s.category}
                          </span>
                          <span className="text-xs font-medium text-text">{s.action}</span>
                        </div>
                        <kbd className="px-2.5 py-1 text-[11px] font-mono text-primary bg-primary-muted border border-primary/30 rounded-lg shadow-sm font-bold">
                          {s.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Data & Storage Tab */}
              {activeTab === 'data' && (
                <Card className="p-7 bg-bg-card/75 backdrop-blur-xl border border-border/80 rounded-2xl shadow-xl space-y-6">
                  <div className="border-b border-border/60 pb-4">
                    <h2 className="text-lg font-bold text-text flex items-center gap-2">
                      <HardDrive className="w-5 h-5 text-primary" />
                      Account Storage & Data Backups
                    </h2>
                    <p className="text-xs text-text-muted mt-1">
                      Manage your workspace local storage allocations and export full account backups.
                    </p>
                  </div>

                  {/* Storage Bar Breakdown */}
                  <div className="p-5 rounded-2xl bg-bg-elevated/40 border border-border/60 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-text flex items-center gap-2">
                        <Database className="w-4 h-4 text-primary" /> Workspace Data Storage
                      </span>
                      <span className="font-mono font-semibold text-text-muted">1.2 MB / Local Storage</span>
                    </div>

                    <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-bg">
                      <div className="w-[45%] bg-primary rounded-full" title="Study Notes & PDFs" />
                      <div className="w-[25%] bg-accent rounded-full" title="Finance Transactions" />
                      <div className="w-[15%] bg-success rounded-full" title="Health Workout Logs" />
                      <div className="w-[15%] bg-warning rounded-full" title="Preferences & Themes" />
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-[10px] text-text-muted pt-1">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" /> Study Notes (45%)</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent" /> Finance Ledger (25%)</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success" /> Health Logs (15%)</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-warning" /> Settings (15%)</span>
                    </div>
                  </div>

                  {/* Download Backup Exporter */}
                  <div className="p-5 rounded-2xl bg-bg-elevated/40 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 max-w-md">
                      <h4 className="text-xs font-bold text-text">Export Account JSON Backup</h4>
                      <p className="text-[11px] text-text-muted leading-relaxed">
                        Generates a single JSON archive containing your settings, theme configurations, and account state.
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleExportAccountData}
                      className="gap-2 cursor-pointer flex-shrink-0"
                    >
                      {exported ? (
                        <>
                          <Check className="w-4 h-4" /> Downloaded!
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" /> Export Backup
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
