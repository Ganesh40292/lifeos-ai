import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Trash2, Calendar, Wallet, Hourglass, Flame, AlertCircle, Info } from 'lucide-react';
import { soundService } from '@/services/soundService';

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Assignment Deadline Tomorrow',
    message: 'Data Structures Midterm Project is due in 24 hours.',
    type: 'WARNING',
    icon: Calendar,
    time: '10m ago',
    unread: true,
  },
  {
    id: 2,
    title: 'Focus Sprint Completed',
    message: 'Completed 25m Focus Block +50 XP awarded!',
    type: 'SUCCESS',
    icon: Hourglass,
    time: '1h ago',
    unread: true,
  },
  {
    id: 3,
    title: 'Monthly Budget Threshold',
    message: 'Dining Category has reached 82% of budget limit.',
    type: 'ALERT',
    icon: Wallet,
    time: '3h ago',
    unread: false,
  },
];

const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const markAllAsRead = () => {
    soundService.playClick();
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const clearAll = () => {
    soundService.playClick();
    setNotifications([]);
  };

  const removeOne = (id) => {
    soundService.playClick();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[80] flex justify-end pointer-events-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative z-10 w-full max-w-sm h-full bg-[#080c14]/95 border-l border-border/80 shadow-2xl flex flex-col backdrop-blur-xl"
        >
          {/* Header */}
          <div className="p-5 border-b border-border/80 flex items-center justify-between bg-bg-card/40">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <h3 className="text-base font-extrabold text-text">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-white">
                  {unreadCount} new
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-text-muted hover:text-text cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Actions Bar */}
          {notifications.length > 0 && (
            <div className="px-5 py-2.5 border-b border-border/40 bg-bg-elevated/20 flex items-center justify-between text-xs">
              <button
                onClick={markAllAsRead}
                className="text-text-muted hover:text-primary transition-colors flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
              <button
                onClick={clearAll}
                className="text-text-faint hover:text-danger transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear all
              </button>
            </div>
          )}

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length > 0 ? (
              notifications.map((n) => {
                const Icon = n.icon;
                return (
                  <div
                    key={n.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                      n.unread
                        ? 'bg-primary/10 border-primary/30 text-text'
                        : 'bg-bg-card/60 border-border/60 text-text-muted'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        n.type === 'SUCCESS' ? 'bg-success/20 text-success' :
                        n.type === 'WARNING' ? 'bg-warning/20 text-warning' : 'bg-primary/20 text-primary'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-text flex items-center gap-1.5">
                          {n.title}
                          {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                        </h4>
                        <p className="text-[11px] text-text-muted leading-relaxed">{n.message}</p>
                        <span className="text-[9px] text-text-faint block font-mono">{n.time}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeOne(n.id)}
                      className="text-text-faint hover:text-text p-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 text-text-muted space-y-2">
                <Bell className="w-8 h-8 text-text-faint" />
                <span className="text-xs font-bold">No Notifications</span>
                <p className="text-[10px] text-text-faint">You are all caught up! Deadline & budget alerts will appear here.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NotificationCenter;
