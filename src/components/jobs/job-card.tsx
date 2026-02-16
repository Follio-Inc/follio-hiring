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
      className="w-full bg-card border border-border rounded-2xl p-5 hover:shadow-lg transition-all text-left group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center text-base">
              {job.roleType === 'developer' ? '💻' : job.roleType === 'designer' ? '🎨' : job.roleType === 'pm' ? '📊' : '👤'}
            </div>
            <h3 className="font-semibold text-foreground group-hover:text-violet-600 transition-colors">
              {job.title}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">{job.department} · {job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)} level</p>
        </div>
        <Badge variant={job.status === 'active' ? 'success' : 'neutral'}>
          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
        </Badge>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-5 mb-4">
        <div className="flex items-center gap-1.5 text-sm text-foreground">
          <Users size={15} className="text-muted-foreground" />
          <span className="font-medium">{job.applicantCount}</span>
          <span className="text-muted-foreground">applicants</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <TrendingUp size={15} className="text-muted-foreground" />
          <span className={cn('font-medium', getFitScoreColor(job.avgFitScore))}>{job.avgFitScore}</span>
          <span className="text-muted-foreground">avg fit</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-foreground">
          <Clock size={15} className="text-muted-foreground" />
          <span className="text-muted-foreground">{formatDate(job.createdAt)}</span>
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
            className="text-xs px-2 py-0.5 rounded-md bg-violet-50 text-violet-700"
          >
            {skill}
          </span>
        ))}
        {job.requiredSkills.length > 5 && (
          <span className="text-xs text-muted-foreground">+{job.requiredSkills.length - 5}</span>
        )}
      </div>
    </button>
  );
}
