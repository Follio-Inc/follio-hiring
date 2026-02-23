'use client';

import { useState, useEffect } from 'react';
import { StageMetric, FUNNEL_STAGE_COLORS, FunnelStage } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface FunnelChartProps {
  stages: StageMetric[];
  totalApplicants: number;
  rejected: number;
}

const MIN_WIDTH_PERCENT = 8;

export function FunnelChart({
  stages,
  totalApplicants,
  rejected,
}: FunnelChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  if (totalApplicants === 0) return null;

  const maxCount = stages[0]?.count || 1;

  function getWidthPercent(count: number): number {
    if (maxCount === 0) return MIN_WIDTH_PERCENT;
    const ratio = count / maxCount;
    return MIN_WIDTH_PERCENT + (100 - MIN_WIDTH_PERCENT) * ratio;
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Hiring Funnel
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Candidate progression through hiring stages
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
            <span className="text-muted-foreground">Pipeline</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="text-muted-foreground">
              Rejected ({rejected})
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        {stages.map((stage, i) => {
          const widthPercent = getWidthPercent(stage.count);
          const colors = FUNNEL_STAGE_COLORS[stage.stage as FunnelStage];
          const isHovered = hoveredIndex === i;

          return (
            <div key={stage.stage}>
              {/* Funnel bar */}
              <div
                className="relative mx-auto cursor-pointer group"
                style={{ width: `${widthPercent}%` }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div
                  className={cn(
                    'relative rounded-lg px-4 py-3 transition-all duration-700 ease-out overflow-hidden',
                    isHovered ? 'shadow-lg scale-[1.02]' : 'shadow-sm',
                  )}
                  style={{
                    backgroundColor: colors.fill,
                    opacity: isHovered ? 1 : 0.85,
                    width: mounted ? '100%' : '0%',
                    transitionProperty: 'width, opacity, box-shadow, transform',
                    transitionDelay: `${i * 100}ms`,
                  }}
                >
                  <div className="flex items-center justify-between text-white min-h-[28px]">
                    <span className="font-semibold text-sm whitespace-nowrap">
                      {stage.label}
                    </span>
                    <div className="flex items-center gap-3 whitespace-nowrap">
                      <span className="text-sm font-bold tabular-nums">
                        {stage.count}
                      </span>
                      {stage.conversionRate !== null && (
                        <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">
                          {stage.conversionRate}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Conversion connector */}
              {i < stages.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <ChevronDown
                    size={14}
                    className="text-gray-300"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hover detail panel */}
      {hoveredIndex !== null && stages[hoveredIndex] && (
        <div className="mt-5 p-4 bg-muted/50 rounded-xl border border-border text-sm animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-foreground">
              {stages[hoveredIndex].label}
            </span>
            <span className="text-foreground font-bold tabular-nums">
              {stages[hoveredIndex].count} candidates
            </span>
          </div>
          <div className="space-y-1 text-muted-foreground">
            {stages[hoveredIndex].conversionRate !== null && (
              <p>
                <span className="font-medium text-foreground">
                  {stages[hoveredIndex].conversionRate}%
                </span>{' '}
                conversion from{' '}
                {stages[hoveredIndex > 0 ? hoveredIndex - 1 : 0].label}
              </p>
            )}
            <p>
              <span className="font-medium text-foreground">
                {stages[hoveredIndex].dropoff}
              </span>{' '}
              {hoveredIndex < stages.length - 1
                ? `didn\u2019t advance to ${stages[hoveredIndex + 1].label}`
                : 'at this final stage'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
