import { create } from 'zustand';
import { Project } from '../types';
import api from '../lib/api';

interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  fetchProjects: (params?: Record<string, string>) => Promise<void>;
  fetchMyProjects: () => Promise<void>;
  createProject: (data: Partial<Project>) => Promise<Project>;
  updateProject: (id: string, data: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  applyToProject: (id: string, remark: string) => Promise<void>;
  finalizeTeam: (id: string) => Promise<void>;
  reviewApplication: (projectId: string, appId: string, action: 'approve' | 'reject') => Promise<void>;
  updateProjectAdminState: (id: string, updates: Partial<Project>) => Promise<void>;
  setProjects: (projects: Project[]) => void;
}

export const useProjectStore = create<ProjectState>()((set, get) => ({
  projects: [],
  loading: false,
  error: null,
  selectedProjectId: null,

  setSelectedProjectId: (id) => set({ selectedProjectId: id }),

  fetchProjects: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const qs = new URLSearchParams(params).toString();
      const projects = await api.get<Project[]>(`/projects${qs ? `?${qs}` : ''}`);
      set({ projects, loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  fetchMyProjects: async () => {
    set({ loading: true, error: null });
    try {
      const projects = await api.get<Project[]>('/projects/mine');
      set({ projects, loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  createProject: async (data) => {
    const project = await api.post<Project>('/projects', data);
    set((state) => ({ projects: [project, ...state.projects] }));
    return project;
  },

  updateProject: async (id, data) => {
    const updated = await api.put<Project>(`/projects/${id}`, data);
    set((state) => ({
      projects: state.projects.map((p) => p.id === id ? updated : p),
    }));
    return updated;
  },

  deleteProject: async (id) => {
    await api.delete(`/projects/${id}`);
    set((state) => ({ projects: state.projects.filter((p) => p.id !== id) }));
  },

  applyToProject: async (id, remark) => {
    await api.post(`/projects/${id}/apply`, { remark });
    // Refresh project to get updated myApplication state
    const updated = await api.get<Project>(`/projects/${id}`);
    set((state) => ({
      projects: state.projects.map((p) => p.id === id ? updated : p),
    }));
  },

  finalizeTeam: async (id) => {
    const res = await api.post<{ project: Project }>(`/projects/${id}/finalize`);
    set((state) => ({
      projects: state.projects.map((p) => p.id === id ? res.project : p),
    }));
  },

  reviewApplication: async (projectId, appId, action) => {
    await api.put(`/projects/${projectId}/applications/${appId}`, { action });
  },

  updateProjectAdminState: async (id, updates) => {
    await get().updateProject(id, updates);
  },

  setProjects: (projects) => set({ projects }),
}));
