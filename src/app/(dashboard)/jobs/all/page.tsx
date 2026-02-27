'use client';

import { Plus, Briefcase } from 'lucide-react';
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
          {jobs.map((job, i) => (
            <div key={job.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
              <JobCard job={job} />
            </div>
          ))}
        </div>

        {jobs.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center mb-4">
              <Briefcase size={24} className="text-stone-400" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-1 tracking-tight">No jobs posted yet</h2>
            <p className="text-sm text-stone-400 mb-4">Create your first job posting to start receiving applicants.</p>
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
