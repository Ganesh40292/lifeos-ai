import { useState, useRef } from 'react';
import { Bell, BellRing, Check, X, Zap, AlertCircle, Flame, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import useNotifications from '@/hooks/useNotifications';
import useClickOutside from '@/hooks/useClickOutside';
import clsx from 'clsx';

const typeConfig = {
  LEVEL_UP:     { icon: Zap,         color: 'text-yellow-400',  bg: 'bg-yellow-400/10' },
  BUDGET_ALERT: { icon: AlertCircle, color: 'text-orange-400',  bg: 'bg-orange-400/10' },
  STREAK:       { icon: Flame,       color: 'text-rose-400',    bg: 'bg-rose-400/10'   },
  INFO:         { icon: TrendingUp,  color: 'text-primary',     bg: 'bg-primary/10'    },
};

const getTypeConfig = (type) => typeConfig[type] || typeConfig.INFO;

const NotificationItem = ({ notification }) => {
  const { icon: Icon, color, bg } = getTypeConfig(notification.type);
  return (
    <div className={clsx(
      'flex items-start gap-3 px-4 py-3 hover:bg-bg-hover transition-colors cursor-default',
      !notification.read && 'bg-primary/5'
    )}>
      <div className={clsx('mt-0.5 p-1.5 rounded-lg flex-shrink-0', bg)}>
        <Icon className={clsx('w-3.5 h-3.5', color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={clsx('text-xs font-semibold truncate', !notification.read ? 'text-text' : 'text-text-secondary')}>
            {notification.title}
          </p>
          {!notification.read && (
            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary" />
          )}
        </div>
        <p className="text-[11px] text-text-faint mt-0.5 leading-relaxed line-clamp-2">
          {notification.message}
        </p>
        <p className="text-[10px] text-text-faint/60 mt-1">
          {notification.createdAt
            ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
            : 'Just now'}
        </p>
      </div>
    </div>
  );
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { notifications, unreadCount, markAllRead } = useNotifications();

  useClickOutside(dropdownRef, () => setOpen(false));

  const handleOpen = () => {
    setOpen(prev => !prev);
  };

  const handleMarkAllRead = () => {
    markAllRead();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg text-text-muted hover:text-text hover:bg-bg-hover transition-colors cursor-pointer"
        aria-label="Notifications"
        id="notification-bell-btn"
      >
        {unreadCount > 0
          ? <BellRing className="w-5 h-5 text-primary animate-[ring_1s_ease-in-out_infinite]" />
          : <Bell className="w-5 h-5" />
        }
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] flex items-center justify-center bg-danger text-white text-[9px] font-bold rounded-full px-0.5 leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-bg-card border border-border rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-text">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-primary/20 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="p-1 rounded text-text-faint hover:text-text hover:bg-bg-hover transition-colors"
                  title="Mark all as read"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded text-text-faint hover:text-text hover:bg-bg-hover transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-border/50">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="w-8 h-8 text-text-faint mb-3" />
                <p className="text-sm text-text-secondary font-medium">You're all caught up!</p>
                <p className="text-xs text-text-faint mt-1">No new notifications</p>
              </div>
            ) : (
              notifications.map(n => (
                <NotificationItem key={n.id} notification={n} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
