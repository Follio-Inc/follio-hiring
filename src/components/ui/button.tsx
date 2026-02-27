'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variants = {
  primary: 'bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-600/20 hover:shadow-xl hover:shadow-amber-600/25',
  secondary: 'bg-white/60 backdrop-blur-sm text-stone-700 border border-white/60 hover:bg-white/80 shadow-sm hover:shadow-md',
  ghost: 'text-stone-500 hover:bg-white/50 hover:text-stone-800',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97]',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
