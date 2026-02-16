'use client';

import { ApplicationStage, STAGE_CONFIG } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StageBadgeProps {
  stage: ApplicationStage;
  size?: 'sm' | 'md';
}

export function StageBadge({ stage, size = 'sm' }: StageBadgeProps) {
  const config = STAGE_CONFIG[stage];
  return (
    <span
      className={cn(
        'inline-flex items-center border rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        config.bgColor,
        config.color
      )}
    >
      {config.label}
    </span>
  );
}
