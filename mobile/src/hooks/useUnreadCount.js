import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { notificationsAPI } from '../services/api';

/**
 * Polls unread notification count for a user every 30 seconds.
 * Also refreshes immediately when the screen comes back into focus.
 */
export function useUnreadCount(userId) {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await notificationsAPI.getAll(userId);
      const arr = Array.isArray(res.data) ? res.data : [];
      setUnreadCount(arr.filter(n => !n.is_read).length);
    } catch {}
  }, [userId]);

  // Refresh on screen focus (clears badge after closing Notifications modal)
  useFocusEffect(useCallback(() => { fetchUnread(); }, [fetchUnread]));

  // Also poll every 30 seconds
  useEffect(() => {
    if (!userId) return;
    const t = setInterval(fetchUnread, 30000);
    return () => clearInterval(t);
  }, [fetchUnread]);

  return { unreadCount };
}
