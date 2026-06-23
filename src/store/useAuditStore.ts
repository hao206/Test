import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuditLog } from '../types';
import { INITIAL_AUDIT_LOGS } from '../data';

interface AuditState {
  auditLogs: AuditLog[];
  addLog: (action: string, moduleName: string, userName: string) => void;
  clearLogs: () => void;
  setAuditLogs: (logs: AuditLog[]) => void;
}

export const useAuditStore = create<AuditState>()(
  persist(
    (set) => ({
      auditLogs: INITIAL_AUDIT_LOGS,

      addLog: (action, moduleName, userName) => {
        const timestampFormatted = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const mockIP = `192.168.1.${Math.floor(Math.random() * 254) + 1}`;
        const newLog: AuditLog = {
          id: `log_${Date.now()}`,
          timestamp: timestampFormatted,
          user: userName || 'Guest System',
          action,
          module: moduleName,
          ip: mockIP,
        };
        set((state) => ({ auditLogs: [newLog, ...state.auditLogs] }));
      },

      clearLogs: () => set({ auditLogs: [] }),

      setAuditLogs: (auditLogs) => set({ auditLogs }),
    }),
    {
      name: 'cfg_audit_store',
    }
  )
);
export default useAuditStore;
