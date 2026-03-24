import React from 'react';
import { cn } from '../lib/utils';

interface AvatarProps {
  src?: string;
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ src, name, className, size = 'md' }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const sizeClasses = {
    sm: 'size-6 text-[10px]',
    md: 'size-10 text-xs',
    lg: 'size-12 text-sm',
  };

  return (
    <div 
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full bg-blue-600/10 items-center justify-center font-bold text-blue-600",
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="aspect-square h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
