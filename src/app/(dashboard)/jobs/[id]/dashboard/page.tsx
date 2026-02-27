'use client';

import { use, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Users,
  Filter,
  MessageSquare,
  Award,
  XCircle,
  Star,
  Download,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/dashboard/metric-card';
import { FunnelChart } from '@/components/dashboard/funnel-chart';
import { useApp } from '@/contexts/app-context';
import { cn } from '@/lib/utils';
import {
  computeJobAnalytics,
  analyticsToCSV,
  downloadCSV,
  FUNNEL_STAGE_LABELS,
  FUNNEL_STAGE_COLORS,
  type JobAnalytics,
} from '@/lib/analytics';

type Period = 'all' | '30d' | '7d';

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: 'all', label: 'All time' },
];

export default function JobDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { jobs, getJobApplications } = useApp();
  const [period, setPeriod] = useState<Period>('all');

  const job = jobs.find((j) => j.id === id);
  const applications = useMemo(
    () => getJobApplications(id),
    [id, getJobApplications],
  );

  const analytics: JobAnalytics | null = useMemo(() => {
    if (!job) return null;
    return computeJobAnalytics(job, applications, period);
  }, [job, applications, period]);

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
          <XCircle size={28} className="text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Job not found
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          This job posting may have been removed or doesn&apos;t exist.
        </p>
        <Button
          variant="secondary"
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft size={14} className="mr-1.5" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  if (!analytics) return null;

  if (analytics.totalApplicants === 0) {
    return (
      <div>
        <Header
          title={`${job.title} — Analytics`}
          subtitle={`${job.department} · Pipeline Overview`}
          actions={
            <Button
              size="sm"
              variant="secondary"
              onClick={() => router.push(`/jobs/${id}`)}
            >
              <ArrowLeft size={14} className="mr-1.5" />
              Back to Job
            </Button>
          }
        />
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
          <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mb-4">
            <Users size={28} className="text-violet-400" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-1">
            No applicants yet
          </h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Once candidates start applying to this position, you&apos;ll see
            funnel analytics, conversion rates, and stage breakdowns here.
          </p>
        </div>
      </div>
    );
  }

  function handleExportCSV() {
    if (!analytics) return;
    const csv = analyticsToCSV(analytics);
    const filename = `${job!.title.replace(/\s+/g, '-').toLowerCase()}-analytics-${period}.csv`;
    downloadCSV(csv, filename);
  }

  const metricCards = [
    {
      label: 'Total Applicants',
      value: analytics.totalApplicants,
      icon: <Users size={20} />,
      color: 'bg-violet-50 text-violet-600',
      conversion: null,
    },
    {
      label: FUNNEL_STAGE_LABELS.reviewing,
      value: analytics.stages[1]?.count ?? 0,
      icon: <Filter size={20} />,
      color: 'bg-indigo-50 text-indigo-600',
      conversion: analytics.stages[1]?.conversionRate ?? null,
    },
    {
      label: FUNNEL_STAGE_LABELS.shortlisted,
      value: analytics.stages[2]?.count ?? 0,
      icon: <Star size={20} />,
      color: 'bg-blue-50 text-blue-600',
      conversion: analytics.stages[2]?.conversionRate ?? null,
    },
    {
      label: FUNNEL_STAGE_LABELS.interview,
      value: analytics.stages[3]?.count ?? 0,
      icon: <MessageSquare size={20} />,
      color: 'bg-cyan-50 text-cyan-600',
      conversion: analytics.stages[3]?.conversionRate ?? null,
    },
    {
      label: FUNNEL_STAGE_LABELS.offer,
      value: analytics.stages[4]?.count ?? 0,
      icon: <Award size={20} />,
      color: 'bg-emerald-50 text-emerald-600',
      conversion: analytics.stages[4]?.conversionRate ?? null,
    },
    {
      label: 'Rejected',
      value: analytics.rejected,
      icon: <XCircle size={20} />,
      color: 'bg-red-50 text-red-500',
      conversion: null,
    },
  ];

  return (
    <div>
      <Header
        title={`${job.title} — Analytics`}
        subtitle={`${job.department} · Pipeline Overview`}
        actions={
          <Button
            size="sm"
            variant="secondary"
            onClick={() => router.push(`/jobs/${id}`)}
          >
            <ArrowLeft size={14} className="mr-1.5" />
            Back to Job
          </Button>
        }
      />

      <div className="p-8 space-y-6">
        {/* Time filter + CSV export */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-white/40 backdrop-blur-sm rounded-xl p-0.5 border border-white/50">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200',
                  period === opt.value
                    ? 'bg-white/80 text-foreground shadow-sm backdrop-blur-sm'
                    : 'text-stone-400 hover:text-stone-600',
                )}
              >
                <Calendar size={12} className="inline mr-1 -mt-0.5" />
                {opt.label}
              </button>
            ))}
          </div>

          <Button size="sm" variant="secondary" onClick={handleExportCSV}>
            <Download size={14} className="mr-1.5" />
            Export CSV
          </Button>
        </div>

        {/* KPI Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {metricCards.map((card, i) => (
            <MetricCard
              key={card.label}
              label={card.label}
              value={card.value}
              icon={card.icon}
              colorClass={card.color}
              conversionRate={card.conversion}
              delay={i * 60}
            />
          ))}
        </div>

        {/* Funnel Visualization */}
        <FunnelChart
          stages={analytics.stages}
          totalApplicants={analytics.totalApplicants}
          rejected={analytics.rejected}
        />

        {/* Stage Distribution Table */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/40">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-stone-400" />
              <h3 className="text-base font-bold text-foreground tracking-tight">
                Stage Breakdown
              </h3>
            </div>
            <p className="text-sm text-stone-400 mt-0.5">
              Detailed view of candidates at each stage
            </p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/40 bg-white/20">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Stage
                </th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Reached
                </th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Conversion
                </th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Drop-off
                </th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3 w-1/3">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/30">
              {analytics.stages.map((stage) => {
                const barWidth =
                  analytics.totalApplicants > 0
                    ? (stage.count / analytics.stages[0].count) * 100
                    : 0;

                return (
                  <tr
                    key={stage.stage}
                    className="hover:bg-white/30 transition-colors"
                  >
                    <td className="px-6 py-3">
                      <span className="text-sm font-medium text-foreground">
                        {stage.label}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className="text-sm font-bold text-foreground tabular-nums">
                        {stage.count}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      {stage.conversionRate !== null ? (
                        <span
                          className={cn(
                            'text-sm font-medium tabular-nums',
                            stage.conversionRate >= 50
                              ? 'text-emerald-600'
                              : stage.conversionRate >= 25
                                ? 'text-amber-600'
                                : 'text-red-500',
                          )}
                        >
                          {stage.conversionRate}%
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {stage.dropoff}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="w-full bg-white/40 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${barWidth}%`,
                            backgroundColor:
                              FUNNEL_STAGE_COLORS[stage.stage as keyof typeof FUNNEL_STAGE_COLORS]
                                ?.fill ?? '#7c3aed',
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-red-50/30">
                <td className="px-6 py-3">
                  <span className="text-sm font-medium text-red-600">
                    Rejected
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                  <span className="text-sm font-bold text-red-600 tabular-nums">
                    {analytics.rejected}
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                  <span className="text-xs text-muted-foreground">—</span>
                </td>
                <td className="px-6 py-3 text-right">
                  <span className="text-xs text-muted-foreground">—</span>
                </td>
                <td className="px-6 py-3">
                  <div className="w-full bg-white/40 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-red-400 transition-all duration-700"
                      style={{
                        width: `${analytics.stages[0].count > 0 ? (analytics.rejected / analytics.stages[0].count) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
