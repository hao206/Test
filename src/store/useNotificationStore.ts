import { create } from 'zustand';
import api from '../lib/api';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'apply' | 'task' | 'comment' | 'badge' | 'info';
}

interface NotificationState {
  notifications: NotificationItem[];
  addNotification: (title: string, description: string, type: NotificationItem['type']) => void;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
    (set, get) => ({
      notifications: [],

      addNotification: (title, description, type) => {
        const newItem: NotificationItem = {
          id: `notif_${Date.now()}`,
          title,
          description,
          time: 'Just now',
          read: false,
          type
        };
        set((state) => ({ notifications: [newItem, ...state.notifications] }));
        api.post('/users/notifications', { title, message: description, type }).catch(() => {});
      },

      fetchNotifications: async () => {
        try {
          const res = await api.get<any[]>('/users/notifications/mine');
          const serverNotifs = res.map(n => ({
            id: String(n.id),
            title: n.title,
            description: n.message,
            time: new Date(n.createdAt).toLocaleString(),
            read: n.read,
            type: n.type
          }));
          set({ notifications: serverNotifs });
        } catch (e) {
          // ignore
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
      }
    })
);
export default useNotificationStore;
