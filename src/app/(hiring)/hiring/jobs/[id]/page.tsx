'use client';

import { use, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, TrendingUp, Sparkles, Settings, BarChart3 } from 'lucide-react';
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

  const job = jobs.find((j) => j.id === id);
  const applications = useMemo(() => getJobApplications(id), [id, getJobApplications]);

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <p className="text-stone-400 mb-4">Job not found.</p>
        <Button variant="ghost" onClick={() => router.push('/hiring/dashboard')}>
          <ArrowLeft size={14} className="mr-1.5" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  const selectedApp = selectedAppId ? applications.find((a) => a.id === selectedAppId) : null;

  return (
    <div>
      <Header
        title={job.title}
        subtitle={`${job.department} · ${job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)}`}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => router.push(`/hiring/jobs/${id}/dashboard`)}>
              <BarChart3 size={14} className="mr-1.5" /> Analytics
            </Button>
            <Button size="sm" variant="secondary">
              <Settings size={14} className="mr-1.5" /> Edit Job
            </Button>
          </div>
        }
      />

      <div className="p-8">
        <div className="mb-6 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-stone-400" />
            <span className="text-sm text-foreground"><strong>{applications.length}</strong> applicants</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-stone-400" />
            <span className={cn('text-sm font-semibold', getFitScoreColor(job.avgFitScore))}>{job.avgFitScore} avg fit</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {job.requiredSkills.slice(0, 6).map((skill) => (
              <Badge key={skill} variant="info" size="sm">{skill}</Badge>
            ))}
          </div>
        </div>

        {job.aiSnapshot && (
          <div className="mb-6 p-5 bg-gradient-to-r from-amber-50/50 via-yellow-50/30 to-orange-50/20 backdrop-blur-xl border border-amber-200/30 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-amber-600" />
              <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Ideal Candidate Snapshot</h3>
            </div>
            <p className="text-sm text-amber-800/60 leading-relaxed">{job.aiSnapshot.idealCandidate}</p>
          </div>
        )}

        <ApplicantTable applications={applications} jobId={id} />
      </div>

      {selectedApp && <CandidateDetail application={selectedApp} onClose={() => setSelectedAppId(null)} />}
    </div>
  );
}
