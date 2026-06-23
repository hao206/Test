import React, { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className = '', error, ...props }, ref) => {
  return (
    <div className="w-full">
      <input
        ref={ref}
        className={`w-full bg-surface border ${error ? 'border-red-500' : 'border-border-dim'} rounded-xl px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent-primary transition-colors placeholder-text-muted ${className}`}
        {...props}
      />
      {error && <span className="text-red-500 text-xs mt-1 inline-block">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
