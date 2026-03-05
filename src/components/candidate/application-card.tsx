'use client';

import Link from 'next/link';
import type { CandidateApplication } from '@/lib/candidate-types';
import { GlassCard } from '@/components/ui/glass-card';
import { FitScoreRing } from '@/components/ui/fit-score';
import { formatDate, stageLabel, stageColor, cn } from '@/lib/utils';
import { Building2, ChevronRight } from 'lucide-react';

interface ApplicationCardProps {
  application: CandidateApplication;
}

export function CandidateApplicationCard({ application }: ApplicationCardProps) {
  return (
    <Link href={`/jobs/${application.jobId}`}>
      <GlassCard hover className="group">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-200/50 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-amber-600" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-stone-800 truncate group-hover:text-amber-700 transition-colors">
              {application.job.title}
            </h3>
            <p className="text-sm text-stone-500 mt-0.5">
              {application.job.company.name} · Applied {formatDate(application.appliedAt)}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-4">
            <span className={cn('inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full', stageColor(application.stage))}>
              {stageLabel(application.stage)}
            </span>
            <FitScoreRing score={application.fitScore} size="sm" showLabel={false} />
          </div>

          <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-amber-600 transition-colors flex-shrink-0" />
        </div>
      </GlassCard>
    </Link>
  );
}
