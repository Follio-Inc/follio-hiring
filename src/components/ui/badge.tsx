'use client';

import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';
  size?: 'sm' | 'md';
  className?: string;
}

const variants = {
  default: 'bg-stone-100 text-stone-700 border-stone-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-violet-50 text-violet-700 border-violet-200',
  neutral: 'bg-stone-50 text-stone-600 border-stone-200',
  primary: 'bg-violet-100 text-violet-700 border-violet-200',
};

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center border rounded-full font-semibold',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
