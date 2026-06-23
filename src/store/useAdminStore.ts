import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AdminUser, NotificationAudience, Role, SystemNotification } from '../types';
import api from '../lib/api';

const nowLabel = () => new Date().toISOString().replace('T', ' ').substring(0, 19);

interface AdminState {
  users: AdminUser[];
  notifications: SystemNotification[];
  loading: boolean;
  fetchUsers: () => Promise<void>;
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

  fetchUsers: async () => {
    set({ loading: true });
    try {
      const users = await api.get<AdminUser[]>('/admin/users');
      set({ users, loading: false });
    } catch (err) {
      console.error('Failed to fetch users', err);
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
    await api.put(`/admin/users/${userId}`, updates);
    set((state) => ({
      users: state.users.map((u) => u.id === userId ? { ...u, ...updates } : u),
    }));
  },

  deleteUser: async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      get().fetchUsers();
    } catch (err) {
      console.error('Failed to delete user', err);
    }
  },

  toggleUserLock: async (userId) => {
    try {
      const user = get().users.find((u) => u.id === userId);
      if (!user) return;
      const locked = user.status !== 'Locked';
      await api.put(`/admin/users/${userId}/status`, { locked });
      get().fetchUsers();
    } catch (err) {
      console.error('Failed to toggle lock', err);
    }
  },

  resetUserPassword: (userId) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId ? { ...u, activityHistory: ['Password reset sent', ...(u.activityHistory || [])] } : u
      ),
    })),

  changeUserRole: async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      get().fetchUsers();
    } catch (err) {
      console.error('Failed to change role', err);
    }
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
