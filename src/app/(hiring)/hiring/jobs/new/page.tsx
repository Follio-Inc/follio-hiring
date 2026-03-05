'use client';

import { Header } from '@/components/layout/header';
import { JobCreationForm } from '@/components/jobs/job-creation-form';

export default function NewJobPage() {
  return (
    <div>
      <Header title="Create New Job" subtitle="Define the role and requirements" />
      <div className="p-6">
        <JobCreationForm />
      </div>
    </div>
  );
}
