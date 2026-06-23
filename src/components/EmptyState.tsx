import React from 'react';

export const EmptyState: React.FC<{ title?: string; description?: string }> = ({ title = 'Nothing here', description }) => {
  return (
    <div className="w-full cf-card p-6 text-center">
      <div className="text-3xl mb-3">🗒️</div>
      <h3 className="text-lg font-bold">{title}</h3>
      {description && <p className="text-sm cf-muted mt-2">{description}</p>}
    </div>
  );
};

export default EmptyState;
