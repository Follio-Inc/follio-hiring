'use client';

import { use, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, UserX } from 'lucide-react';
import { CandidateDetail } from '@/components/applicants/candidate-detail';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/app-context';

export default function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: candidateId } = use(params);
  const searchParams = useSearchParams();
  const jobId = searchParams.get('job') || '';
  const router = useRouter();
  const { applications } = useApp();

  const application = useMemo(
    () => applications.find(a => a.candidateId === candidateId && a.jobId === jobId),
    [applications, candidateId, jobId]
  );

  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center mb-4">
          <UserX size={24} className="text-stone-400" />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-1 tracking-tight">Candidate not found</h2>
        <p className="text-sm text-stone-400 mb-4">This candidate may not exist for this job.</p>
        <Button variant="secondary" onClick={() => router.back()}>
          <ArrowLeft size={14} className="mr-1.5" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="p-4 border-b border-stone-200/80 bg-white/80 backdrop-blur-xl">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft size={14} className="mr-1.5" /> Back to Applicants
        </Button>
      </div>
      <CandidateDetail
        application={application}
        onClose={() => router.back()}
      />
    </div>
  );
}
