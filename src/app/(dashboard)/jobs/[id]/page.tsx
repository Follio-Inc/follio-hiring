'use client';

import { use, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Users,
  TrendingUp,
  Sparkles,
  Settings,
  BarChart3,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { ApplicantTable } from '@/components/applicants/applicant-table';
import { CandidateDetail } from '@/components/applicants/candidate-detail';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/app-context';
import { cn, getFitScoreColor } from '@/lib/utils';

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { jobs, getJobApplications } = useApp();
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  const job = jobs.find(j => j.id === id);
  const applications = useMemo(() => getJobApplications(id), [id, getJobApplications]);

  if (!job) {
    return (
      <div className="p-6">
        <p className="text-stone-400">Job not found.</p>
        <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mt-2">
          <ArrowLeft size={14} className="mr-1.5" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  const selectedApp = selectedAppId
    ? applications.find(a => a.id === selectedAppId)
    : null;

  return (
    <div>
      <Header
        title={job.title}
        subtitle={`${job.department} · ${job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)}`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => router.push(`/jobs/${id}/dashboard`)}
            >
              <BarChart3 size={14} className="mr-1.5" />
              Analytics
            </Button>
            <Button size="sm" variant="secondary">
              <Settings size={14} className="mr-1.5" />
              Edit Job
            </Button>
          </div>
        }
      />

      <div className="p-6">
        {/* Job Quick Info */}
        <div className="mb-6 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-stone-400" />
            <span className="text-sm text-foreground"><strong>{applications.length}</strong> applicants</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-stone-400" />
            <span className={cn('text-sm font-semibold', getFitScoreColor(job.avgFitScore))}>
              {job.avgFitScore} avg fit
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {job.requiredSkills.slice(0, 6).map(skill => (
              <Badge key={skill} variant="info" size="sm">{skill}</Badge>
            ))}
          </div>
        </div>

        {/* AI Snapshot */}
        {job.aiSnapshot && (
          <div className="mb-6 p-5 bg-gradient-to-r from-violet-50/80 via-purple-50/60 to-indigo-50/40 border border-violet-100/60 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-violet-600" />
              <h3 className="text-xs font-bold text-violet-900 uppercase tracking-wider">Ideal Candidate Snapshot</h3>
            </div>
            <p className="text-sm text-violet-800/80 leading-relaxed">{job.aiSnapshot.idealCandidate}</p>
          </div>
        )}

        {/* Applicant Table */}
        <ApplicantTable applications={applications} jobId={id} />
      </div>

      {/* Candidate Detail Drawer */}
      {selectedApp && (
        <CandidateDetail
          application={selectedApp}
          onClose={() => setSelectedAppId(null)}
        />
      )}
    </div>
  );
}
