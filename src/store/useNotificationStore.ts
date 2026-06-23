import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  persist(
    (set) => ({
      notifications: [
        {
          id: 'n1',
          title: 'Project Application • Đơn ứng tuyển mới',
          description: 'Bao Trung applied to join "UTT Course Planner" with matching NodeJS credentials.',
          time: '10m ago',
          read: false,
          type: 'apply'
        },
        {
          id: 'n2',
          title: 'Agile Task Assigned • Giao việc thành công',
          description: 'You were assigned to: "Secure JWT Authentication Middleware". Deadline: June 18.',
          time: '1h ago',
          read: false,
          type: 'task'
        },
        {
          id: 'n3',
          title: 'Badge Unlocked • Đạt huy chương mới',
          description: 'Congratulations! You unlocked the "🛡️ Sec Specialist" badge for contribution.',
          time: '3h ago',
          read: true,
          type: 'badge'
        }
      ],

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
        // attempt to sync to server silently
        try {
          fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, message: description, type })
          });
        } catch (e) {
          // ignore network errors for now
        }
      },

      fetchNotifications: async () => {
        try {
          const res = await fetch('/api/notifications');
          if (res.ok) {
            const json = await res.json();
            set({ notifications: json });
          }
        } catch (e) {
          // network or server unavailable
        }
      },

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          )
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true }))
        })),

      clearAll: () => set({ notifications: [] })
    }),
    {
      name: 'cfg_notification_store'
    }
  )
);
export default useNotificationStore;
