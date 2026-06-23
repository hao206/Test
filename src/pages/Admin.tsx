import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { AdminSystemAuditModule } from '../components/AdminSystemAudit';
import { translations } from '../translations';

export const Admin: React.FC = () => {
  const { lang, accent } = useUIStore();
  const t = translations[lang];
  const user = useAuthStore((s) => s.user);

  const isGovUser = user?.role === 'Admin' || user?.role === 'Super Admin';

  if (!isGovUser) {
    return (
      <div className="bg-[#111111] border border-red-500/10 p-8 rounded-[32px] text-center max-w-md mx-auto space-y-4 font-sans">
        <span className="text-3xl">⚠️</span>
        <h2 className="text-lg font-black text-white uppercase tracking-wider">Access Intercepted</h2>
        <p className="text-xs text-slate-400">
          This administration dashboard contains restricted governance credentials. Only Campus Administrators are authorized to audit system metadata.
        </p>
      </div>
    );
  }

  return (
    <AdminSystemAuditModule 
      t={t}
      accentColor={accent}
    />
  );
};

export default Admin;
