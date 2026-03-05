'use client';

import { cn, getFitScoreColor, getFitScoreBg, fitScoreColor, fitScoreRingColor } from '@/lib/utils';

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
          getFitScoreColor(score),
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

export function FitScoreBar({ score, label }: { score: number; label?: string }) {
  if (label) {
    return (
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-sm text-stone-600">{label}</span>
          <span className={cn('text-sm font-medium', fitScoreColor(score))}>{score}%</span>
        </div>
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-1000 ease-out',
              score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-stone-300',
            )}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    );
  }

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
            score >= 85 ? 'bg-emerald-500' : score >= 70 ? 'bg-amber-500' : score >= 50 ? 'bg-orange-500' : 'bg-red-400',
          )}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

interface FitScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const ringConfig = {
  sm: { dimension: 48, strokeWidth: 4, radius: 18, fontSize: 'text-xs' },
  md: { dimension: 72, strokeWidth: 5, radius: 28, fontSize: 'text-lg' },
  lg: { dimension: 104, strokeWidth: 6, radius: 42, fontSize: 'text-2xl' },
};

export function FitScoreRing({ score, size = 'md', showLabel = true, className }: FitScoreRingProps) {
  const config = ringConfig[size];
  const circumference = 2 * Math.PI * config.radius;
  const offset = circumference - (score / 100) * circumference;
  const center = config.dimension / 2;

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div className="relative" style={{ width: config.dimension, height: config.dimension }}>
        <svg width={config.dimension} height={config.dimension} className="-rotate-90">
          <circle cx={center} cy={center} r={config.radius} fill="none" stroke="currentColor" strokeWidth={config.strokeWidth} className="text-stone-200" />
          <circle
            cx={center}
            cy={center}
            r={config.radius}
            fill="none"
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn('transition-all duration-1000 ease-out', fitScoreRingColor(score))}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('font-semibold', config.fontSize, fitScoreColor(score))}>{score}</span>
        </div>
      </div>
      {showLabel && <span className="text-xs font-medium text-stone-500">Fit Score</span>}
    </div>
  );
}
