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
      className="bg-white border border-stone-200/80 rounded-2xl p-4 animate-fade-in-up hover:shadow-lg hover:shadow-stone-200/30 transition-all duration-300"
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
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            {conversionRate}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground tabular-nums tracking-tight">
        {value.toLocaleString()}
      </p>
      <p className="text-sm text-stone-400 mt-0.5">{label}</p>
    </div>
  );
}
