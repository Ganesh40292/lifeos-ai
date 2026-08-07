import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, LogOut, User, Settings, ChevronDown, Menu, Zap, 
  Sun, Moon, Sparkles, Volume2, VolumeX, Globe, Bell
} from 'lucide-react';
import { motion } from 'framer-motion';
import NotificationBell from '@/components/notifications/NotificationBell';
import NotificationCenter from '@/components/ui/NotificationCenter';
import clsx from 'clsx';
import Avatar from '@/components/ui/Avatar';
import XPBar from '@/components/gamification/XPBar';
import VoiceButton from '@/components/ui/VoiceButton';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { useAuth } from '@/hooks/useAuth';
import useClickOutside from '@/hooks/useClickOutside';
import { NAV_ITEMS, APP_NAME } from '@/utils/constants';
import { useTheme } from '@/context/ThemeProvider';
import { useLanguage } from '@/context/LanguageContext';
import { soundService } from '@/services/soundService';

/**
 * Top navigation bar with Breadcrumbs, Command Palette trigger, notifications, and user menu.
 */
const Topbar = ({ toggleMobileOpen, onOpenCommandPalette, onOpenCopilot }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [muted, setMuted] = useState(() => soundService.isMuted());

  const userMenuRef = useRef(null);
  const langMenuRef = useRef(null);

  const { user, logout } = useAuth();
  const { themeId, setThemeId } = useTheme();
  const { currentLang, changeLanguage, LANGUAGES } = useLanguage();

  const location = useLocation();
  const navigate = useNavigate();

  useClickOutside(userMenuRef, () => setUserMenuOpen(false));
  useClickOutside(langMenuRef, () => setLangMenuOpen(false));

  const handleToggleSfx = () => {
    const isMutedNow = soundService.toggleMute();
    setMuted(isMutedNow);
    if (!isMutedNow) soundService.playSuccess();
  };

  const currentPage =
    NAV_ITEMS.find((item) =>
      item.path === '/'
        ? location.pathname === '/'
        : location.pathname.startsWith(item.path)
    )?.label || APP_NAME;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={clsx(
        'h-[var(--topbar-height)] border-b border-border bg-bg-card/85 backdrop-blur-md',
        'flex items-center justify-between px-4 sm:px-6',
        'sticky top-0 z-20'
      )}
    >
      {/* Left — Mobile Hamburger + Logo / Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileOpen}
          className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-bg-hover lg:hidden cursor-pointer"
          aria-label="Toggle mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-text">{APP_NAME}</span>
        </div>

        <span className="h-4 w-px bg-border lg:hidden" />

        <div className="hidden sm:block">
          <Breadcrumbs />
        </div>

        <h1 className="sm:hidden text-sm font-semibold text-text truncate max-w-[120px]">
          {currentPage}
        </h1>
      </div>

      {/* Right — XP Bar, Copilot, SFX, Language, Notifications, Voice, User Menu */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <XPBar user={user} />

        {/* AI Copilot Sparkle Launcher */}
        <button
          onClick={onOpenCopilot}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all text-xs font-bold cursor-pointer"
          title="Open AI Copilot (Ctrl + Shift + A)"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Copilot</span>
        </button>

        {/* SFX Toggle */}
        <button
          onClick={handleToggleSfx}
          className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-bg-hover transition-colors cursor-pointer"
          title={muted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
        >
          {muted ? <VolumeX className="w-4 h-4 text-text-faint" /> : <Volume2 className="w-4 h-4 text-primary" />}
        </button>

        {/* Language Selector Dropdown */}
        <div className="relative hidden sm:block" ref={langMenuRef}>
          <button
            onClick={() => setLangMenuOpen((prev) => !prev)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-border/60 hover:bg-bg-hover text-xs font-medium text-text-muted transition-colors cursor-pointer"
            title="Switch Language"
          >
            <span>{currentLang.flag}</span>
            <span className="uppercase text-[10px] font-bold">{currentLang.code}</span>
          </button>

          {langMenuOpen && (
            <div className="absolute right-0 mt-2 w-36 py-1 rounded-xl border border-border bg-bg-card shadow-xl z-50">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    changeLanguage(l.code);
                    setLangMenuOpen(false);
                    soundService.playClick();
                  }}
                  className={`flex items-center justify-between w-full px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                    currentLang.code === l.code
                      ? 'bg-primary/15 text-primary font-bold'
                      : 'text-text-muted hover:bg-bg-hover hover:text-text'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Command Palette trigger button */}
        <button
          onClick={onOpenCommandPalette}
          className={clsx(
            'hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-bg-input',
            'text-xs text-text-muted hover:text-text hover:border-border-light',
            'transition-all duration-150 cursor-pointer w-44 justify-between'
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-text-faint flex-shrink-0" />
            <span>Command...</span>
          </span>
          <kbd className="px-1.5 py-0.5 text-[10px] text-text-faint bg-bg-elevated border border-border rounded font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Center Trigger */}
        <button
          onClick={() => {
            setNotificationCenterOpen(true);
            soundService.playClick();
          }}
          className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-bg-hover transition-colors cursor-pointer relative"
          title="Notification Center"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </button>

        {/* Voice Commander */}
        <VoiceButton />

        {/* Theme Toggle */}
        <button
          id="theme-toggle-btn"
          onClick={() => {
            setThemeId(themeId === 'light' ? 'midnight' : 'light');
            soundService.playToggle();
          }}
          className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-bg-hover transition-colors cursor-pointer"
          aria-label="Toggle Theme"
        >
          {themeId === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-warning" />}
        </button>

        {/* Notification Center Drawer */}
        <NotificationCenter
          isOpen={notificationCenterOpen}
          onClose={() => setNotificationCenterOpen(false)}
        />

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-bg-hover transition-colors cursor-pointer"
          >
            <Avatar name={user?.fullName} size="sm" />
            <span className="hidden sm:block text-xs font-medium text-text-secondary max-w-[100px] truncate">
              {user?.fullName || 'User'}
            </span>
            <ChevronDown
              className={clsx(
                'w-3.5 h-3.5 text-text-faint transition-transform duration-150',
                userMenuOpen && 'rotate-180'
              )}
            />
          </button>

          {/* Dropdown */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 py-1 rounded-xl border border-border bg-bg-card shadow-lg animate-[fade-in_0.15s_ease-out]">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-xs font-semibold text-text truncate">
                  {user?.fullName}
                </p>
                <p className="text-[11px] text-text-faint truncate">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate('/settings');
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-text-muted hover:bg-bg-hover hover:text-text transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                Profile
              </button>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate('/settings');
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-text-muted hover:bg-bg-hover hover:text-text transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                Settings
              </button>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  logout();
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-danger hover:bg-danger-muted transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Topbar;
