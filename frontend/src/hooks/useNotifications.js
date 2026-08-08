import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { WS_BASE_URL } from '@/utils/constants';

/**
 * Hook to manage real-time WebSocket notifications + REST fallback.
 * Subscribes to /topic/notifications/{userId} on mount.
 */
const useNotifications = () => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);

  // Fetch existing notifications from REST
  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get('/notifications');
      if (res.data?.success) {
        const list = res.data.data || [];
        setNotifications(list);
        const unread = list.filter(n => !n.read && !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [token]);

  // Mark all as read
  const markAllRead = useCallback(async () => {
    if (!token) return;
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
    }
  }, [token]);

  // Connect via WebSocket
  useEffect(() => {
    if (!user?.id || !token) return;

    fetchNotifications();

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_BASE_URL),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        // Subscribe to user-specific notification channel
        client.subscribe(`/topic/notifications/${user.id}`, (message) => {
          try {
            const notification = JSON.parse(message.body);
            setNotifications(prev => [notification, ...prev.slice(0, 49)]);
            setUnreadCount(prev => prev + 1);
          } catch (e) {
            console.error('Failed to parse notification:', e);
          }
        });
      },
      onDisconnect: () => {
        setConnected(false);
      },
      onStompError: (frame) => {
        console.warn('STOMP error:', frame);
      }
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [user?.id, token]);

  return { notifications, unreadCount, connected, markAllRead, fetchNotifications };
};

export default useNotifications;
