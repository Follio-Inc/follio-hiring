'use client';

import { useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { ComparisonView } from '@/components/compare/comparison-view';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/app-context';

function CompareContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('job') || '';
  const router = useRouter();
  const { applications, compareIds } = useApp();

  const comparedApplications = useMemo(
    () => applications.filter((a) => compareIds.includes(a.candidateId) && a.jobId === jobId),
    [applications, compareIds, jobId],
  );

  if (comparedApplications.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <p className="text-stone-400 mb-4">Select at least 2 candidates to compare.</p>
        <Button variant="ghost" onClick={() => router.push(`/hiring/jobs/${jobId}`)}>
          <ArrowLeft size={14} className="mr-1.5" /> Back to Job
        </Button>
      </div>
    );
  }

  return <ComparisonView applications={comparedApplications} jobId={jobId} onClose={() => router.push(`/hiring/jobs/${jobId}`)} />;
}

export default function ComparePage() {
  return (
    <div>
      <Header title="Compare Candidates" subtitle="Side-by-side candidate analysis" />
      <div className="p-8">
        <Suspense fallback={<p className="text-stone-400">Loading...</p>}>
          <CompareContent />
        </Suspense>
      </div>
    </div>
  );
}
