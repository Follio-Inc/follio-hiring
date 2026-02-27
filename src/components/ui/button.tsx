'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variants = {
  primary: 'bg-violet-700 text-white hover:bg-violet-800 shadow-md shadow-violet-200/40 hover:shadow-lg hover:shadow-violet-200/50',
  secondary: 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 shadow-sm hover:shadow-md',
  ghost: 'text-stone-600 hover:bg-stone-100 hover:text-stone-800',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-200/40',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200/40',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
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
        'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
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
