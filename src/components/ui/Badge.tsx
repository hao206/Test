import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: "bg-surface border-border-dim text-text-secondary",
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
    danger: "bg-red-500/10 border-red-500/20 text-red-400",
    info: "bg-accent-primary/10 border-accent-primary/20 text-accent-primary"
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
