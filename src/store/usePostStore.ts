import { create } from 'zustand';
import { Post } from '../types';
import api from '../lib/api';

interface PostState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  fetchPosts: (params?: Record<string, string>) => Promise<void>;
  addPost: (content: string, _images: string[], topic: string) => Promise<Post>;
  likePost: (postId: string) => Promise<void>;
  addComment: (postId: string, commentText: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  deleteComment: (postId: string, commentId: string) => Promise<void>;
  moderatePost: (postId: string, action: 'Approve' | 'Reject') => Promise<void>;
  updatePostAdminState: (postId: string, updates: Partial<Post>) => Promise<void>;
  setPosts: (posts: Post[]) => void;
}

export const usePostStore = create<PostState>()((set) => ({
  posts: [],
  loading: false,
  error: null,

  fetchPosts: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const qs = new URLSearchParams(params).toString();
      const posts = await api.get<Post[]>(`/posts${qs ? `?${qs}` : ''}`);
      set({ posts, loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  addPost: async (content, images, topic) => {
    const post = await api.post<Post>('/posts', { content, images, topic });
    set((state) => ({ posts: [post, ...state.posts] }));
    return post;
  },

  likePost: async (postId) => {
    const res = await api.post<{ likes: number; likedByMe: boolean }>(`/posts/${postId}/like`);
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, likes: res.likes, likedByMe: res.likedByMe, loved: res.likedByMe } : p
      ),
    }));
  },

  addComment: async (postId, commentText) => {
    const comment = await api.post<any>(`/posts/${postId}/comments`, { content: commentText });
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId
          ? { ...p, comments: [...(p.comments || []), comment] }
          : p
      ),
    }));
  },

  deletePost: async (postId) => {
    await api.delete(`/posts/${postId}`);
    set((state) => ({ posts: state.posts.filter((p) => p.id !== postId) }));
  },

  deleteComment: async (postId, commentId) => {
    await api.delete(`/posts/${postId}/comments/${commentId}`);
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId
          ? { ...p, comments: (p.comments || []).filter((c: any) => c.id !== commentId) }
          : p
      ),
    }));
  },

  moderatePost: async (postId, action) => {
    const modStatus = action === 'Approve' ? 'Approved' : 'Rejected';
    await api.put(`/posts/${postId}/moderate`, { moderationStatus: modStatus });
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, moderationStatus: modStatus } : p
      ),
    }));
  },

  updatePostAdminState: async (postId, updates) => {
    await api.put(`/posts/${postId}/moderate`, updates);
    set((state) => ({
      posts: state.posts.map((p) => p.id === postId ? { ...p, ...updates } : p),
    }));
  },

  setPosts: (posts) => set({ posts }),
}));
