'use client';

import { cn, getFitScoreColor, getFitScoreBg } from '@/lib/utils';

interface FitScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function FitScore({ score, size = 'md', showLabel = false }: FitScoreProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-16 h-16 text-lg',
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-bold border backdrop-blur-sm',
          sizeClasses[size],
          getFitScoreBg(score),
          getFitScoreColor(score)
        )}
      >
        {score}
      </div>
      {showLabel && (
        <span className={cn('text-xs font-medium', getFitScoreColor(score))}>
          {score >= 85 ? 'Strong Match' : score >= 70 ? 'Good Fit' : score >= 50 ? 'Moderate' : 'Low Match'}
        </span>
      )}
    </div>
  );
}

export function FitScoreBar({ score }: { score: number }) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-stone-400">Fit Score</span>
        <span className={cn('text-sm font-bold', getFitScoreColor(score))}>{score}</span>
      </div>
      <div className="w-full bg-white/40 backdrop-blur-sm rounded-full h-1.5">
        <div
          className={cn(
            'h-1.5 rounded-full transition-all duration-700',
            score >= 85 ? 'bg-emerald-500' : score >= 70 ? 'bg-amber-500' : score >= 50 ? 'bg-orange-500' : 'bg-red-400'
          )}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
