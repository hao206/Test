import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Resource } from '../types';
import { INITIAL_RESOURCES } from '../data';

interface ResourceState {
  resources: Resource[];
  addResource: (title: string, category: Resource['category'], size: string, sharedBy: string, fileType?: string, link?: string) => Resource;
  incrementDownloads: (resId: string) => void;
  updateResourceAdminState: (resId: string, updates: Partial<Pick<Resource, 'reviewStatus' | 'category'>>) => void;
  deleteResource: (resId: string) => void;
  setResources: (resources: Resource[]) => void;
}

// In-memory file link store (not persisted to avoid localStorage quota issues with large base64 data)
const fileLinksCache: Record<string, string> = {};

export const useResourceStore = create<ResourceState>()(
  persist(
    (set, get) => ({
      resources: INITIAL_RESOURCES,

      addResource: (title, category, size, sharedBy, fileType, link) => {
        const id = `r_${Date.now()}`;
        // Store large data URL in memory cache only, keep persisted link as '#' or http URL
        const persistedLink =
          link && (link.startsWith('data:') || link.startsWith('blob:'))
            ? '#'  // strip from localStorage
            : (link || '#');

        // Cache the actual download link in memory so the same session can still download
        if (link && (link.startsWith('data:') || link.startsWith('blob:'))) {
          fileLinksCache[id] = link;
        }

        const added: Resource = {
          id,
          title,
          category,
          sharedBy,
          downloads: 0,
          size,
          link: persistedLink,
          reviewStatus: 'Pending',
          fileType: fileType || (title.toLowerCase().endsWith('.doc') || title.toLowerCase().endsWith('.docx') ? '.docx' : '.pdf'),
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

      // Helper to get resolved download link (in-memory cache takes priority)
      getDownloadLink: (resId: string): string => {
        const cached = fileLinksCache[resId];
        if (cached) return cached;
        const res = get().resources.find(r => r.id === resId);
        return res?.link || '#';
      },
    }),
    {
      name: 'cfg_resources_store',
      // Custom serializer: strip large data URLs from persisted state to prevent quota errors
      partialize: (state) => ({
        resources: state.resources.map(r => ({
          ...r,
          link: r.link && (r.link.startsWith('data:') || r.link.startsWith('blob:')) ? '#' : r.link,
        })),
      }),
    }
  )
);

// Expose the in-memory cache so ResourceModule can look up the actual file link for download
export const getResourceFileLink = (id: string, fallback: string): string => {
  return fileLinksCache[id] || fallback;
};

export default useResourceStore;
