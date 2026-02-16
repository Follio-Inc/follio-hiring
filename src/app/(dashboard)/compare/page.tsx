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
    () => applications.filter(
      a => compareIds.includes(a.candidateId) && a.jobId === jobId
    ),
    [applications, compareIds, jobId]
  );

  return (
    <div>
      <Header
        title="Compare Candidates"
        subtitle={`${comparedApplications.length} candidates selected`}
        actions={
          <Button size="sm" variant="ghost" onClick={() => router.back()}>
            <ArrowLeft size={14} className="mr-1.5" />
            Back
          </Button>
        }
      />

      <div className="p-6">
        <ComparisonView
          applications={comparedApplications}
          jobId={jobId}
          onClose={() => router.back()}
        />
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-400">Loading comparison...</div>}>
      <CompareContent />
    </Suspense>
  );
}
