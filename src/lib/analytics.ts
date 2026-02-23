import { ApplicationStage, Job, Application } from './types';

// ============================================================
// Funnel Stage Configuration
// ============================================================

export const FUNNEL_STAGES = [
  'new',
  'reviewing',
  'shortlisted',
  'interview',
  'offer',
] as const;

export type FunnelStage = (typeof FUNNEL_STAGES)[number];

export const FUNNEL_STAGE_LABELS: Record<FunnelStage, string> = {
  new: 'Applied',
  reviewing: 'Screening',
  shortlisted: 'Shortlisted',
  interview: 'Interview',
  offer: 'Offer',
};

export const FUNNEL_STAGE_COLORS: Record<
  FunnelStage,
  { bg: string; text: string; fill: string }
> = {
  new: { bg: 'bg-violet-100', text: 'text-violet-700', fill: '#7c3aed' },
  reviewing: { bg: 'bg-indigo-100', text: 'text-indigo-700', fill: '#6366f1' },
  shortlisted: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    fill: '#3b82f6',
  },
  interview: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-700',
    fill: '#06b6d4',
  },
  offer: { bg: 'bg-emerald-100', text: 'text-emerald-700', fill: '#10b981' },
};

// ============================================================
// Types
// ============================================================

export interface StageMetric {
  stage: FunnelStage;
  label: string;
  count: number;
  conversionRate: number | null;
  dropoff: number;
}

export interface JobAnalytics {
  jobId: string;
  jobTitle: string;
  department: string;
  totalApplicants: number;
  rejected: number;
  stages: StageMetric[];
  stageDistribution: Record<ApplicationStage, number>;
  period: 'all' | '30d' | '7d';
}

// ============================================================
// Computation
// ============================================================

function computeDistribution(
  applications: Application[],
): Record<ApplicationStage, number> {
  const dist: Record<ApplicationStage, number> = {
    new: 0,
    reviewing: 0,
    shortlisted: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
  };
  for (const app of applications) {
    dist[app.stage]++;
  }
  return dist;
}

function computeFunnelMetrics(
  distribution: Record<ApplicationStage, number>,
): StageMetric[] {
  const cumulativeCounts: number[] = [];

  for (let i = 0; i < FUNNEL_STAGES.length; i++) {
    let cumulative = 0;
    for (let j = i; j < FUNNEL_STAGES.length; j++) {
      cumulative += distribution[FUNNEL_STAGES[j]];
    }
    cumulativeCounts.push(cumulative);
  }

  return FUNNEL_STAGES.map((stage, i) => {
    const count = cumulativeCounts[i];
    const previousCount = i > 0 ? cumulativeCounts[i - 1] : null;
    const conversionRate =
      previousCount !== null && previousCount > 0
        ? Math.round((count / previousCount) * 1000) / 10
        : null;
    const nextCount =
      i < cumulativeCounts.length - 1 ? cumulativeCounts[i + 1] : 0;
    const dropoff = count - nextCount;

    return { stage, label: FUNNEL_STAGE_LABELS[stage], count, conversionRate, dropoff };
  });
}

export function computeJobAnalytics(
  job: Job,
  applications: Application[],
  period: 'all' | '30d' | '7d' = 'all',
): JobAnalytics {
  const now = new Date();

  const filtered = applications.filter((app) => {
    if (period === 'all') return true;
    const appliedAt = new Date(app.appliedAt);
    const daysAgo =
      (now.getTime() - appliedAt.getTime()) / (1000 * 60 * 60 * 24);
    return period === '7d' ? daysAgo <= 7 : daysAgo <= 30;
  });

  const distribution: Record<ApplicationStage, number> =
    period === 'all' ? { ...job.stageBreakdown } : computeDistribution(filtered);

  const totalApplicants = Object.values(distribution).reduce(
    (sum, c) => sum + c,
    0,
  );

  const stages = computeFunnelMetrics(distribution);

  return {
    jobId: job.id,
    jobTitle: job.title,
    department: job.department,
    totalApplicants,
    rejected: distribution.rejected,
    stages,
    stageDistribution: distribution,
    period,
  };
}

// ============================================================
// CSV Export
// ============================================================

export function analyticsToCSV(analytics: JobAnalytics): string {
  const headers = ['Stage', 'Count', 'Conversion Rate', 'Drop-off'];
  const rows = analytics.stages.map((s) => [
    s.label,
    s.count.toString(),
    s.conversionRate !== null ? `${s.conversionRate}%` : 'N/A',
    s.dropoff.toString(),
  ]);
  rows.push(['Rejected', analytics.rejected.toString(), '', '']);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
