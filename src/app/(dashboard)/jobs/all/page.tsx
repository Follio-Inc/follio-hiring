'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { JobCard } from '@/components/jobs/job-card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/app-context';

export default function AllJobsPage() {
  const router = useRouter();
  const { jobs } = useApp();

  return (
    <div>
      <Header
        title="All Jobs"
        subtitle={`${jobs.length} jobs total`}
        actions={
          <Button size="sm" onClick={() => router.push('/jobs/new')}>
            <Plus size={14} className="mr-1.5" />
            Post Job
          </Button>
        }
      />

      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {jobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        {jobs.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">No jobs posted yet.</p>
            <Button onClick={() => router.push('/jobs/new')}>
              <Plus size={14} className="mr-1.5" />
              Post your first job
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
