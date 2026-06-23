import { create } from 'zustand';
import { AdminUser, NotificationAudience, Role, SystemNotification } from '../types';
import api from '../lib/api';

const nowLabel = () => new Date().toISOString().replace('T', ' ').substring(0, 19);

interface AdminState {
  users: AdminUser[];
  notifications: SystemNotification[];
  loading: boolean;
  fetchUsers: (params?: Record<string, string>) => Promise<void>;
  createUser: (payload: Pick<AdminUser, 'fullName' | 'email' | 'role'>) => void;
  updateUser: (userId: string, updates: Partial<AdminUser>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  toggleUserLock: (userId: string) => Promise<void>;
  resetUserPassword: (userId: string) => void;
  changeUserRole: (userId: string, role: Role) => Promise<void>;
  addSystemNotification: (payload: Pick<SystemNotification, 'title' | 'channel' | 'audience' | 'message'>) => void;
}

export const useAdminStore = create<AdminState>()((set, get) => ({
  users: [],
  notifications: [],
  loading: false,

  fetchUsers: async (params = {}) => {
    set({ loading: true });
    try {
      const qs = new URLSearchParams(params).toString();
      const raw = await api.get<any[]>(`/users${qs ? `?${qs}` : ''}`);
      const users: AdminUser[] = raw.map((u) => ({
        id: String(u.id),
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        status: u.locked ? 'Locked' : 'Active',
        lastActiveAt: u.lastActiveAt || nowLabel(),
        activityHistory: [],
      }));
      set({ users, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createUser: (payload) =>
    set((state) => ({
      users: [{
        id: `u_${Date.now()}`,
        ...payload,
        status: 'Active',
        lastActiveAt: nowLabel(),
        activityHistory: ['Created by Admin'],
      }, ...state.users],
    })),

  updateUser: async (userId, updates) => {
    await api.put(`/users/${userId}/admin`, updates);
    set((state) => ({
      users: state.users.map((u) => u.id === userId ? { ...u, ...updates } : u),
    }));
  },

  deleteUser: async (userId) => {
    await api.delete(`/users/${userId}`);
    set((state) => ({ users: state.users.filter((u) => u.id !== userId) }));
  },

  toggleUserLock: async (userId) => {
    const user = get().users.find((u) => u.id === userId);
    if (!user) return;
    const locked = user.status !== 'Locked';
    await api.put(`/users/${userId}/admin`, { locked });
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId ? { ...u, status: locked ? 'Locked' : 'Active' } : u
      ),
    }));
  },

  resetUserPassword: (userId) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId ? { ...u, activityHistory: ['Password reset sent', ...(u.activityHistory || [])] } : u
      ),
    })),

  changeUserRole: async (userId, role) => {
    await api.put(`/users/${userId}/admin`, { role });
    set((state) => ({
      users: state.users.map((u) => u.id === userId ? { ...u, role } : u),
    }));
  },

  addSystemNotification: (payload) =>
    set((state) => ({
      notifications: [{
        id: `sys_${Date.now()}`,
        ...payload,
        audience: payload.audience as NotificationAudience,
        createdAt: nowLabel(),
      }, ...state.notifications],
    })),
}));

export default useAdminStore;
