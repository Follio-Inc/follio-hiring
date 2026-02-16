'use client';

import { use, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
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
      <div className="p-6">
        <p className="text-gray-400 mb-4">Candidate not found for this job.</p>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft size={14} className="mr-1.5" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="p-4 border-b border-gray-200 bg-white">
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
