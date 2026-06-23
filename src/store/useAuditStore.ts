import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuditLog } from '../types';
import api from '../lib/api';

interface AuditState {
  auditLogs: AuditLog[];
  fetchAuditLogs: () => Promise<void>;
  addLog: (action: string, moduleName: string, userName: string) => Promise<void>;
  clearLogs: () => Promise<void>;
  setAuditLogs: (logs: AuditLog[]) => void;
}

export const useAuditStore = create<AuditState>()(
  persist(
    (set, get) => ({
      auditLogs: [],

      fetchAuditLogs: async () => {
        try {
          const logs = await api.get<AuditLog[]>('/admin/audit-logs');
          set({ auditLogs: logs });
        } catch (err) {
          console.error('Failed to fetch audit logs', err);
        }
      },

      addLog: async (action, moduleName, userName) => {
        try {
          await api.post('/admin/audit-logs', { action, module: moduleName, userName });
          // Optionally refetch logs, but usually they just rely on the API now
          get().fetchAuditLogs();
        } catch (err) {
          console.error('Failed to add audit log', err);
        }
      },

      clearLogs: async () => {
        try {
          await api.delete('/admin/audit-logs');
          set({ auditLogs: [] });
        } catch (err) {
          console.error('Failed to clear audit logs', err);
        }
      },

      setAuditLogs: (auditLogs) => set({ auditLogs }),
    }),
    {
      name: 'cfg_audit_store',
    }
  )
);
export default useAuditStore;
