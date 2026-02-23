'use client';

import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  conversionRate?: number | null;
  colorClass: string;
  delay?: number;
}

export function MetricCard({
  label,
  value,
  icon,
  conversionRate,
  colorClass,
  delay = 0,
}: MetricCardProps) {
  return (
    <div
      className="bg-card border border-border rounded-2xl p-4 animate-fade-in-up opacity-0"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            colorClass,
          )}
        >
          {icon}
        </div>
        {conversionRate !== null && conversionRate !== undefined && (
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            {conversionRate}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground tabular-nums">
        {value.toLocaleString()}
      </p>
      <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
