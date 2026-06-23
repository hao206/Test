import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Role, UserProfile } from '../types';
import api from '../lib/api';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  accounts: any[];
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string; password: string; fullName: string; studentId: string;
    faculty?: string; major?: string; academicYear?: string;
  }) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshMe: () => Promise<void>;
  clearError: () => void;
  addReputation: (amount: number) => void;
  authenticate: (email: string, password: string) => any;
  registerAccount: (account: any) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,
      error: null,
      accounts: [],

      clearError: () => set({ error: null }),

      login: async (email: string, password: string) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post<{ token: string; user: UserProfile }>('/auth/login', { email, password });
          localStorage.setItem('cf_token', res.token);
          set({ token: res.token, user: res.user, loading: false });
        } catch (err: any) {
          set({ loading: false, error: err.message });
          throw err;
        }
      },

      register: async (data: any) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post<{ token: string; user: UserProfile }>('/auth/register', data);
          localStorage.setItem('cf_token', res.token);
          set({ token: res.token, user: res.user, loading: false });
        } catch (err: any) {
          set({ loading: false, error: err.message });
          throw err;
        }
      },

      loginAsGuest: () => {
        const guestUser: UserProfile = {
          id: 'u_guest',
          fullName: 'Guest Student',
          studentId: 'GUEST01',
          email: 'guest@campusforge.edu',
          role: 'Guest' as Role,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
          coverPhoto: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
          faculty: 'General Education',
          major: 'None',
          academicYear: 'Freshman',
          biography: 'Exploring projects in read-only guest mode.',
          skills: [],
          interests: [],
          careerGoals: '',
          reputationScore: 0,
          completedProjects: [],
        };
        localStorage.removeItem('cf_token');
        set({ user: guestUser, token: null });
      },

      logout: () => {
        localStorage.removeItem('cf_token');
        set({ user: null, token: null });
      },

      updateProfile: async (updates: Partial<UserProfile>) => {
        set({ loading: true, error: null });
        try {
          const updated = await api.put<UserProfile>('/auth/profile', updates);
          set({ user: updated, loading: false });
        } catch (err: any) {
          set({ loading: false, error: err.message });
          throw err;
        }
      },

      refreshMe: async () => {
        const token = localStorage.getItem('cf_token');
        if (!token) return;
        try {
          const user = await api.get<UserProfile>('/auth/me');
          set({ user });
        } catch { /* handled by api client */ }
      },

      addReputation: (_amount: number) => {},
      authenticate: (_e: string, _p: string) => undefined,
      registerAccount: (_a: any) => false,
    }),
    {
      name: 'cfg_auth_store',
      partialize: (state: any) => ({ user: state.user, token: state.token }),
    }
  )
);

if (typeof window !== 'undefined') {
  (window as any).authStore = useAuthStore;
}
