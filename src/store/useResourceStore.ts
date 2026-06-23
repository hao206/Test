import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Resource } from '../types';
import { INITIAL_RESOURCES } from '../data';

interface ResourceState {
  resources: Resource[];
  addResource: (title: string, category: Resource['category'], size: string, sharedBy: string) => Resource;
  incrementDownloads: (resId: string) => void;
  updateResourceAdminState: (resId: string, updates: Pick<Partial<Resource>, 'reviewStatus' | 'category'>) => void;
  deleteResource: (resId: string) => void;
  setResources: (resources: Resource[]) => void;
}

export const useResourceStore = create<ResourceState>()(
  persist(
    (set) => ({
      resources: INITIAL_RESOURCES,

      addResource: (title, category, size, sharedBy) => {
        const added: Resource = {
          id: `r_${Date.now()}`,
          title,
          category,
          sharedBy,
          downloads: 0,
          size,
          link: '#',
          reviewStatus: 'Pending',
        };
        set((state) => ({ resources: [added, ...state.resources] }));
        return added;
      },

      incrementDownloads: (resId) =>
        set((state) => ({
          resources: state.resources.map((res) =>
            res.id === resId ? { ...res, downloads: res.downloads + 1 } : res
          ),
        })),

      updateResourceAdminState: (resId, updates) =>
        set((state) => ({
          resources: state.resources.map((res) =>
            res.id === resId ? { ...res, ...updates } : res
          ),
        })),

      deleteResource: (resId) =>
        set((state) => ({
          resources: state.resources.filter((res) => res.id !== resId),
        })),

      setResources: (resources) => set({ resources }),
    }),
    {
      name: 'cfg_resources_store',
    }
  )
);
export default useResourceStore;
