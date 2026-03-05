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
    () => applications.find((a) => a.candidateId === candidateId && a.jobId === jobId),
    [applications, candidateId, jobId],
  );

  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
          <UserX size={28} className="text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Candidate not found</h2>
        <Button variant="secondary" onClick={() => router.push('/hiring/dashboard')}>
          <ArrowLeft size={14} className="mr-1.5" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  return <CandidateDetail application={application} onClose={() => router.push(`/hiring/jobs/${jobId}`)} />;
}
