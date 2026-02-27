'use client';

import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';
  size?: 'sm' | 'md';
  className?: string;
}

const variants = {
  default: 'bg-stone-100/80 text-stone-600 border-stone-200/60',
  success: 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60',
  warning: 'bg-amber-50/80 text-amber-700 border-amber-200/60',
  danger: 'bg-red-50/80 text-red-700 border-red-200/60',
  info: 'bg-amber-50/80 text-amber-700 border-amber-200/60',
  neutral: 'bg-white/50 text-stone-500 border-stone-200/50',
  primary: 'bg-amber-100/80 text-amber-800 border-amber-200/60',
};

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center border rounded-full font-semibold backdrop-blur-sm',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
