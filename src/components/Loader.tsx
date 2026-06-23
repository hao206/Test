import React from 'react';

export const Loader: React.FC<{ size?: number; message?: string }> = ({ size = 36, message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
        <path d="M22 12a10 10 0 00-10-10" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" />
      </svg>
      {message && <div className="text-sm cf-muted mt-2">{message}</div>}
    </div>
  );
};

export default Loader;
