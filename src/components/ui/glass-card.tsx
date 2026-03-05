'use client';

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'strong' | 'subtle';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: 'div' | 'article' | 'section';
}

const variantClasses = {
  default: 'bg-white/50 backdrop-blur-xl border border-white/60',
  strong: 'bg-white/70 backdrop-blur-xl border border-white/60',
  subtle: 'bg-white/30 backdrop-blur-lg border border-white/30',
};

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function GlassCard({
  children,
  className,
  variant = 'default',
  hover = false,
  padding = 'md',
  as: Component = 'div',
}: GlassCardProps) {
  return (
    <Component
      className={cn(
        'rounded-2xl',
        variantClasses[variant],
        paddingClasses[padding],
        hover &&
          'transition-all duration-300 hover:shadow-lg hover:shadow-amber-900/5 hover:-translate-y-0.5 hover:bg-white/60',
        className,
      )}
    >
      {children}
    </Component>
  );
}
