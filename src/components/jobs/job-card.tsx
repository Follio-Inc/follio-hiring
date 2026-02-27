'use client';

import { useRouter } from 'next/navigation';
import { Users, TrendingUp, Clock } from 'lucide-react';
import { Job, STAGE_CONFIG, ApplicationStage } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn, formatDate, getFitScoreColor } from '@/lib/utils';

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const router = useRouter();

  const stageEntries = Object.entries(job.stageBreakdown).filter(
    ([_, count]) => count > 0
  ) as [ApplicationStage, number][];

  return (
    <button
      onClick={() => router.push(`/jobs/${job.id}`)}
      className="w-full bg-white border border-stone-200/80 rounded-2xl p-5 hover:shadow-lg hover:shadow-stone-200/40 hover:-translate-y-0.5 transition-all duration-300 text-left group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-violet-100/80 flex items-center justify-center text-base">
              {job.roleType === 'developer' ? '💻' : job.roleType === 'designer' ? '🎨' : job.roleType === 'pm' ? '📊' : '👤'}
            </div>
            <h3 className="font-bold text-foreground group-hover:text-violet-700 transition-colors tracking-tight">
              {job.title}
            </h3>
          </div>
          <p className="text-sm text-stone-400">{job.department} · {job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)} level</p>
        </div>
        <Badge variant={job.status === 'active' ? 'success' : 'neutral'}>
          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
        </Badge>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-5 mb-4">
        <div className="flex items-center gap-1.5 text-sm text-foreground">
          <Users size={15} className="text-stone-400" />
          <span className="font-semibold tabular-nums">{job.applicantCount}</span>
          <span className="text-stone-400">applicants</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <TrendingUp size={15} className="text-stone-400" />
          <span className={cn('font-semibold tabular-nums', getFitScoreColor(job.avgFitScore))}>{job.avgFitScore}</span>
          <span className="text-stone-400">avg fit</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-foreground">
          <Clock size={15} className="text-stone-400" />
          <span className="text-stone-400">{formatDate(job.createdAt)}</span>
        </div>
      </div>

      {/* Stage Breakdown */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {stageEntries.map(([stage, count]) => (
          <span
            key={stage}
            className={cn(
              'text-xs px-2 py-0.5 rounded-full border font-medium',
              STAGE_CONFIG[stage].bgColor,
              STAGE_CONFIG[stage].color,
            )}
          >
            {STAGE_CONFIG[stage].label}: {count}
          </span>
        ))}
      </div>

      {/* Skills */}
      <div className="mt-3 flex items-center gap-1.5 flex-wrap">
        {job.requiredSkills.slice(0, 5).map(skill => (
          <span
            key={skill}
            className="text-xs px-2 py-0.5 rounded-lg bg-violet-50/80 text-violet-700 font-medium"
          >
            {skill}
          </span>
        ))}
        {job.requiredSkills.length > 5 && (
          <span className="text-xs text-stone-400">+{job.requiredSkills.length - 5}</span>
        )}
      </div>
    </button>
  );
}
