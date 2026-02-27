'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md';
}

export function StarRating({ rating, onChange, size = 'sm' }: StarRatingProps) {
  const iconSize = size === 'sm' ? 14 : 18;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star === rating ? 0 : star)}
          className={cn(
            'transition-all duration-200',
            onChange ? 'cursor-pointer hover:text-amber-400 hover:scale-110' : 'cursor-default',
            star <= rating ? 'text-amber-400' : 'text-stone-300'
          )}
          disabled={!onChange}
        >
          <Star
            size={iconSize}
            fill={star <= rating ? 'currentColor' : 'none'}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}
