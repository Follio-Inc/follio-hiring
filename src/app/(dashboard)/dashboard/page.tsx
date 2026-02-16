'use client';

import {
  Briefcase,
  Users,
  TrendingUp,
  Clock,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { JobCard } from '@/components/jobs/job-card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/app-context';

export default function DashboardPage() {
  const router = useRouter();
  const { jobs, applications } = useApp();

  const activeJobs = jobs.filter(j => j.status === 'active');
  const totalApplicants = applications.length;
  const avgFitScore = Math.round(
    applications.reduce((acc, a) => acc + a.fitScore, 0) / Math.max(applications.length, 1)
  );
  const newApplicants = applications.filter(a => a.stage === 'new').length;

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle="Overview of your hiring pipeline"
        actions={
          <Button size="sm" onClick={() => router.push('/jobs/new')}>
            <Plus size={14} className="mr-1.5" />
            Post Job
          </Button>
        }
      />

      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Briefcase size={20} />}
            label="Active Jobs"
            value={activeJobs.length.toString()}
            color="bg-violet-50 text-violet-600"
          />
          <StatCard
            icon={<Users size={20} />}
            label="Total Applicants"
            value={totalApplicants.toString()}
            color="bg-purple-50 text-purple-600"
          />
          <StatCard
            icon={<TrendingUp size={20} />}
            label="Avg Fit Score"
            value={avgFitScore.toString()}
            color="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            icon={<Clock size={20} />}
            label="New Applications"
            value={newApplicants.toString()}
            color="bg-amber-50 text-amber-600"
          />
        </div>

        {/* AI Insight Banner */}
        <div className="mb-8 p-4 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 rounded-2xl flex items-start gap-3">
          <div className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles size={16} className="text-violet-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-violet-900 mb-1">AI Hiring Insight</h3>
            <p className="text-sm text-violet-700">
              You have {newApplicants} new applications awaiting review.
              {avgFitScore >= 70
                ? ' The average fit score is strong — your job descriptions are attracting well-matched candidates.'
                : ' Consider refining job descriptions to attract more aligned candidates.'}
              {' '}Your top pipeline is the {activeJobs[0]?.title || 'latest role'} with {activeJobs[0]?.applicantCount || 0} applicants.
            </p>
          </div>
        </div>

        {/* Active Jobs */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Active Jobs</h2>
            <button
              onClick={() => router.push('/jobs/all')}
              className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {activeJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>

        {/* Recent Applications */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Applications</h2>
          <div className="bg-card border border-border rounded-2xl divide-y divide-border">
            {applications
              .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
              .slice(0, 5)
              .map(app => {
                const job = jobs.find(j => j.id === app.jobId);
                return (
                  <button
                    key={app.id}
                    onClick={() => router.push(`/jobs/${app.jobId}`)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-violet-50/30 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {app.candidate.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{app.candidate.name}</p>
                        <p className="text-xs text-muted-foreground">{job?.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold ${app.fitScore >= 70 ? 'text-emerald-600' : app.fitScore >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                        {app.fitScore}
                      </span>
                      <ArrowRight size={14} className="text-gray-300" />
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
