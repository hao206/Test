import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuditLog } from '../types';
import api from '../lib/api';

interface AuditState {
  auditLogs: AuditLog[];
  fetchAuditLogs: () => Promise<void>;
  addLog: (action: string, moduleName: string, userName: string) => void;
  clearLogs: () => Promise<void>;
  setAuditLogs: (logs: AuditLog[]) => void;
}

export const useAuditStore = create<AuditState>()(
  persist(
    (set) => ({
      auditLogs: [],

      fetchAuditLogs: async () => {
        try {
          const logs = await api.get<AuditLog[]>('/admin/audit-logs');
          set({ auditLogs: logs });
        } catch (err) {
          // 403 is expected for non-admin users — silently ignore
        }
      },

      // Fire-and-forget: push audit log to server, never blocks the UI
      addLog: (action, moduleName, userName) => {
        api.post('/admin/audit-logs', { action, module: moduleName, userName }).catch(() => {});
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
