import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '@/hooks/useAuth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

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
      const res = await fetch(`${API_BASE}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data || []);
        const unread = (data.data || []).filter(n => !n.read).length;
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
      await fetch(`${API_BASE}/api/notifications/mark-all-read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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
      webSocketFactory: () => new SockJS(`${API_BASE}/ws`),
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
