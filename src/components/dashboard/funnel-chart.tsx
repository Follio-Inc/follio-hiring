'use client';

import { useState, useEffect } from 'react';
import { StageMetric, FUNNEL_STAGE_COLORS, FunnelStage } from '@/lib/analytics';

interface FunnelChartProps {
  stages: StageMetric[];
  totalApplicants: number;
  rejected: number;
}

const SVG_WIDTH = 520;
const LAYER_HEIGHT = 54;
const LAYER_GAP = 2;
const SIDE_PADDING = 10;
const MIN_WIDTH_RATIO = 0.14;

export function FunnelChart({
  stages,
  totalApplicants,
  rejected,
}: FunnelChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  if (totalApplicants === 0) return null;

  const maxCount = stages[0]?.count || 1;
  const totalHeight =
    stages.length * LAYER_HEIGHT + (stages.length - 1) * LAYER_GAP;
  const centerX = SVG_WIDTH / 2;
  const maxHalf = (SVG_WIDTH - SIDE_PADDING * 2) / 2;
  const minHalf = maxHalf * MIN_WIDTH_RATIO;

  function getHalfWidth(count: number) {
    const ratio = maxCount > 0 ? count / maxCount : 0;
    return minHalf + (maxHalf - minHalf) * ratio;
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

      {/* SVG Funnel */}
      <div className="flex justify-center">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${totalHeight}`}
          className="w-full max-w-[560px] h-auto"
          role="img"
          aria-label="Hiring funnel visualization"
        >
          {stages.map((stage, i) => {
            const y = i * (LAYER_HEIGHT + LAYER_GAP);
            const topHalf = getHalfWidth(stage.count);
            const nextCount =
              i < stages.length - 1
                ? stages[i + 1].count
                : Math.max(stage.count * 0.4, 0);
            const bottomHalf = getHalfWidth(nextCount);
            const colors = FUNNEL_STAGE_COLORS[stage.stage as FunnelStage];
            const isHovered = hoveredIndex === i;

            const path = [
              `M ${centerX - topHalf} ${y}`,
              `L ${centerX + topHalf} ${y}`,
              `L ${centerX + bottomHalf} ${y + LAYER_HEIGHT}`,
              `L ${centerX - bottomHalf} ${y + LAYER_HEIGHT}`,
              'Z',
            ].join(' ');

            return (
              <g
                key={stage.stage}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                <path
                  d={path}
                  fill={colors.fill}
                  style={{
                    opacity: mounted ? (isHovered ? 1 : 0.82) : 0,
                    filter: isHovered
                      ? 'brightness(1.08) drop-shadow(0 2px 6px rgba(0,0,0,.15))'
                      : 'none',
                    transition: `opacity 0.5s ease ${i * 0.09}s, filter 0.2s ease`,
                  }}
                />
                {/* Stage label */}
                <text
                  x={centerX}
                  y={y + LAYER_HEIGHT / 2 - 6}
                  textAnchor="middle"
                  fill="white"
                  fontSize={13}
                  fontWeight={600}
                  style={{
                    opacity: mounted ? 1 : 0,
                    transition: `opacity 0.4s ease ${i * 0.09 + 0.15}s`,
                  }}
                  className="pointer-events-none select-none"
                >
                  {stage.label}
                </text>
                <text
                  x={centerX}
                  y={y + LAYER_HEIGHT / 2 + 12}
                  textAnchor="middle"
                  fill="white"
                  fontSize={11}
                  style={{
                    opacity: mounted ? 0.9 : 0,
                    transition: `opacity 0.4s ease ${i * 0.09 + 0.2}s`,
                  }}
                  className="pointer-events-none select-none"
                >
                  {stage.count} candidates
                  {stage.conversionRate !== null
                    ? ` · ${stage.conversionRate}%`
                    : ''}
                </text>
              </g>
            );
          })}
        </svg>
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
