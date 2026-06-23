import React from 'react';

export interface AvatarProps {
  src: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt = "Avatar", size = 'md', className = '' }) => {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-8.5 h-8.5",
    lg: "w-10 h-10"
  };

  return (
    <img 
      src={src} 
      alt={alt}
      className={`rounded-full object-cover border border-border-dim ${sizes[size]} ${className}`}
    />
  );
};
