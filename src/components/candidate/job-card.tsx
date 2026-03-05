'use client';

import Link from 'next/link';
import type { CandidateJob } from '@/lib/candidate-types';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { formatSalary, formatRelativeDate } from '@/lib/utils';
import { MapPin, Building2, Clock, DollarSign } from 'lucide-react';

interface JobCardProps {
  job: CandidateJob;
}

export function CandidateJobCard({ job }: JobCardProps) {
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.currency);

  return (
    <GlassCard hover className="group">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-200/50 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-6 h-6 text-amber-600" />
        </div>

        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <Link
              href={`/jobs/${job.id}`}
              className="text-lg font-semibold text-stone-800 hover:text-amber-700 transition-colors line-clamp-1"
            >
              {job.title}
            </Link>
            <p className="text-sm text-stone-500 mt-0.5">{job.company.name}</p>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-stone-500">
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {job.location}
            </span>
            {salary && (
              <span className="inline-flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                {salary}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatRelativeDate(job.createdAt)}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {job.requiredSkills.slice(0, 4).map((skill) => (
              <span key={skill} className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-stone-100 text-stone-600">
                {skill}
              </span>
            ))}
            {job.requiredSkills.length > 4 && (
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-stone-100 text-stone-600">
                +{job.requiredSkills.length - 4}
              </span>
            )}
          </div>
        </div>

        <div className="sm:ml-4 flex-shrink-0">
          <Link href={`/jobs/${job.id}`}>
            <Button variant="outline" size="sm">View role</Button>
          </Link>
        </div>
      </div>
    </GlassCard>
  );
}
