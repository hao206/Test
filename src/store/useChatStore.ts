import { create } from 'zustand';
import api from '../lib/api';

export interface ChatMessage {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  createdAt: string;
}

interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  fetchMessages: (projectId: string) => Promise<void>;
  sendMessage: (projectId: string, message: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  loading: false,
  error: null,

  fetchMessages: async (projectId: string) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<ChatMessage[]>(`/projects/${projectId}/chat`);
      set({ messages: res, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  sendMessage: async (projectId: string, message: string) => {
    try {
      const res = await api.post<ChatMessage>(`/projects/${projectId}/chat`, { message });
      set((state) => ({
        messages: [...state.messages, res]
      }));
    } catch (err: any) {
      throw err;
    }
  }
}));

export default useChatStore;
