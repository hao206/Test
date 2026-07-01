import { create } from 'zustand';
import api from '../lib/api';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  targetId?: string;
  type: 'apply' | 'task' | 'comment' | 'badge' | 'info' | 'admin' | 'success' | string;
}

interface NotificationState {
  notifications: NotificationItem[];
  lastFetched: number;
  addNotification: (title: string, description: string, type: NotificationItem['type']) => void;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  deleteNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>()(
  (set, get) => ({
    notifications: [],
    lastFetched: 0,

    addNotification: (title, description, type) => {
      // Optimistic local add
      const newItem: NotificationItem = {
        id: `notif_${Date.now()}`,
        title,
        description,
        time: 'Vừa xong',
        read: false,
        type
      };
      set((state) => ({ notifications: [newItem, ...state.notifications] }));
      // Also push to server so the other party can see it
      api.post('/users/notifications', { title, message: description, type }).catch(() => {});
    },

    fetchNotifications: async () => {
      try {
        const res = await api.get<any[]>('/users/notifications/mine');
        const serverNotifs: NotificationItem[] = res.map(n => ({
          id: String(n.id),
          title: n.title,
          description: n.message,
          time: formatRelativeTime(n.createdAt),
          read: n.read,
          targetId: n.targetId ? String(n.targetId) : undefined,
          type: n.type
        }));

        // Merge: keep local-only notifications (id starts with 'notif_') that haven't synced yet
        const current = get().notifications;
        const localOnly = current.filter(n => n.id.startsWith('notif_'));
        const merged = [...serverNotifs, ...localOnly.filter(l => !serverNotifs.some(s => s.title === l.title && s.description === l.description))];

        set({ notifications: merged, lastFetched: Date.now() });
      } catch {
        // ignore — user might not be logged in
      }
    },

    markAsRead: (id) => {
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        )
      }));
      if (!id.startsWith('notif_')) {
        api.put(`/users/notifications/${id}/read`).catch(() => {});
      }
    },

    markAllAsRead: () => {
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true }))
      }));
      api.put('/users/notifications/read-all').catch(() => {});
    },

    clearAll: () => {
      set({ notifications: [] });
      api.delete('/users/notifications/clear').catch(() => {});
    },

    deleteNotification: (id) => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id)
      }));
      if (!id.startsWith('notif_')) {
        api.delete(`/users/notifications/${id}`).catch(() => {});
      }
    }
  })
);

function formatRelativeTime(isoString: string): string {
  try {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} giờ trước`;
    return `${Math.floor(hrs / 24)} ngày trước`;
  } catch {
    return 'Vừa xong';
  }
}

export default useNotificationStore;
