import React from 'react';
import { useToastStore } from '../../store/useToastStore';

export const ToastStack: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => removeToast(toast.id)}
          className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl flex items-center justify-between gap-3 animate-fade-in cursor-pointer hover:scale-[1.02] active:scale-95 transition-all text-xs font-sans font-bold ${
            toast.type === 'success' 
              ? 'bg-surface/95 border-emerald-500/30 text-emerald-400' 
              : toast.type === 'error'
              ? 'bg-surface/95 border-red-500/30 text-red-400'
              : 'bg-surface/95 border-accent-primary/30 text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{toast.message}</span>
          </div>
          <button className="text-slate-500 hover:text-white ml-2 text-sm leading-none">×</button>
        </div>
      ))}
    </div>
  );
};
