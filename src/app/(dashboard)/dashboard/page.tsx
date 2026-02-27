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
          {[
            { icon: <Briefcase size={20} />, label: 'Active Jobs', value: activeJobs.length, iconBg: 'bg-violet-100/80 text-violet-600', delay: 0 },
            { icon: <Users size={20} />, label: 'Total Applicants', value: totalApplicants, iconBg: 'bg-purple-100/80 text-purple-600', delay: 1 },
            { icon: <TrendingUp size={20} />, label: 'Avg Fit Score', value: avgFitScore, iconBg: 'bg-emerald-100/80 text-emerald-600', delay: 2 },
            { icon: <Clock size={20} />, label: 'New Applications', value: newApplicants, iconBg: 'bg-amber-100/80 text-amber-600', delay: 3 },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-stone-200/80 rounded-2xl p-5 animate-fade-in-up hover:shadow-lg hover:shadow-stone-200/30 transition-all duration-300"
              style={{ animationDelay: `${stat.delay * 80}ms` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.iconBg}`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-[1.75rem] font-bold text-foreground tracking-tight">{stat.value}</p>
              <p className="text-sm text-stone-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* AI Insight Banner */}
        <div
          className="mb-8 p-5 bg-gradient-to-r from-violet-50/80 via-purple-50/60 to-indigo-50/40 border border-violet-100/60 rounded-2xl flex items-start gap-4 animate-fade-in-up"
          style={{ animationDelay: '320ms' }}
        >
          <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles size={16} className="text-violet-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-violet-900 mb-1">AI Hiring Insight</h3>
            <p className="text-sm text-violet-700/80 leading-relaxed">
              You have {newApplicants} new applications awaiting review.
              {avgFitScore >= 70
                ? ' The average fit score is strong — your job descriptions are attracting well-matched candidates.'
                : ' Consider refining job descriptions to attract more aligned candidates.'}
              {' '}Your top pipeline is the {activeJobs[0]?.title || 'latest role'} with {activeJobs[0]?.applicantCount || 0} applicants.
            </p>
          </div>
        </div>

        {/* Active Jobs */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground tracking-tight">Active Jobs</h2>
            <button
              onClick={() => router.push('/jobs/all')}
              className="text-sm text-violet-700 hover:text-violet-800 font-semibold flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {activeJobs.map((job, i) => (
              <div key={job.id} className="animate-fade-in-up" style={{ animationDelay: `${480 + i * 80}ms` }}>
                <JobCard job={job} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="animate-fade-in-up" style={{ animationDelay: '640ms' }}>
          <h2 className="text-lg font-bold text-foreground mb-4 tracking-tight">Recent Applications</h2>
          <div className="bg-white border border-stone-200/80 rounded-2xl divide-y divide-stone-100 overflow-hidden">
            {applications
              .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
              .slice(0, 5)
              .map(app => {
                const job = jobs.find(j => j.id === app.jobId);
                return (
                  <button
                    key={app.id}
                    onClick={() => router.push(`/jobs/${app.jobId}`)}
                    className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-violet-50/30 transition-all duration-200 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-violet-200/50">
                        {app.candidate.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{app.candidate.name}</p>
                        <p className="text-xs text-stone-400">{job?.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold tabular-nums ${app.fitScore >= 70 ? 'text-emerald-600' : app.fitScore >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                        {app.fitScore}
                      </span>
                      <ArrowRight size={14} className="text-stone-300" />
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
