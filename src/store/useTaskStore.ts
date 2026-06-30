import { create } from 'zustand';
import { Task, TaskStatus } from '../types';
import api from '../lib/api';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: (projectId: string) => Promise<void>;
  addTask: (data: Partial<Task> & { projectId: string }) => Promise<Task>;
  updateTask: (id: string, data: Partial<Task>) => Promise<Task>;
  updateTaskStatus: (id: string, newStatus: TaskStatus) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addComment: (taskId: string, content: string) => Promise<void>;
  reorderTasks: (updates: { id: string; status: string; position: number }[]) => Promise<void>;
  setTasks: (tasks: Task[]) => void;
}

export const useTaskStore = create<TaskState>()((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const tasks = await api.get<Task[]>(`/tasks?projectId=${projectId}`);
      set({ tasks, loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  addTask: async (data) => {
    const task = await api.post<Task>('/tasks', data);
    set((state) => ({ tasks: [task, ...state.tasks] }));
    return task;
  },

  updateTask: async (id, data) => {
    const updated = await api.put<Task>(`/tasks/${id}`, data);
    set((state) => ({
      tasks: state.tasks.map((t) => {
        if (t.id !== id) return t;
        const cleanUpdated = Object.fromEntries(Object.entries(updated || {}).filter(([_, v]) => v !== undefined));
        return { ...t, ...cleanUpdated };
      }),
    }));
    return updated;
  },

  updateTaskStatus: async (id, newStatus) => {
    await get().updateTask(id, { status: newStatus } as any);
  },

  deleteTask: async (id) => {
    await api.delete(`/tasks/${id}`);
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
  },

  addComment: async (taskId, content) => {
    const comment = await api.post<any>(`/tasks/${taskId}/comments`, { content });
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, comments: [...((t as any).comments || []), comment] }
          : t
      ),
    }));
  },

  reorderTasks: async (updates) => {
    await api.put('/tasks/bulk/reorder', { updates });
    set((state) => ({
      tasks: state.tasks.map((t) => {
        const upd = updates.find((u) => u.id === t.id);
        return upd ? { ...t, status: upd.status as TaskStatus, position: upd.position } : t;
      }),
    }));
  },

  setTasks: (tasks) => set({ tasks }),
}));

export default useTaskStore;
