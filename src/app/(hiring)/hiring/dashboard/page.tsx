'use client';

import { Briefcase, Users, TrendingUp, Clock, Plus, ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { JobCard } from '@/components/jobs/job-card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/app-context';

export default function HiringDashboardPage() {
  const router = useRouter();
  const { jobs, applications, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-stone-400 animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  const activeJobs = jobs.filter((j) => j.status === 'active');
  const totalApplicants = applications.length;
  const avgFitScore = Math.round(
    applications.reduce((acc, a) => acc + a.fitScore, 0) / Math.max(applications.length, 1),
  );
  const newApplicants = applications.filter((a) => a.stage === 'new').length;

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle="Overview of your hiring pipeline"
        actions={
          <Button size="sm" onClick={() => router.push('/hiring/jobs/new')}>
            <Plus size={14} className="mr-1.5" /> Post Job
          </Button>
        }
      />

      <div className="p-8">
        <div className="grid grid-cols-4 gap-5 mb-10">
          {[
            { icon: <Briefcase size={20} />, label: 'Active Jobs', value: activeJobs.length, iconColor: 'text-amber-600', delay: 0 },
            { icon: <Users size={20} />, label: 'Total Applicants', value: totalApplicants, iconColor: 'text-orange-500', delay: 1 },
            { icon: <TrendingUp size={20} />, label: 'Avg Fit Score', value: avgFitScore, iconColor: 'text-emerald-500', delay: 2 },
            { icon: <Clock size={20} />, label: 'New Applications', value: newApplicants, iconColor: 'text-sky-500', delay: 3 },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-2xl p-6 animate-fade-in-up hover:bg-white/70 hover:shadow-xl hover:shadow-black/[0.04] transition-all duration-300"
              style={{ animationDelay: `${stat.delay * 80}ms` }}
            >
              <div className={`mb-4 ${stat.iconColor}`}>{stat.icon}</div>
              <p className="text-3xl font-bold text-foreground tracking-tight tabular-nums">{stat.value}</p>
              <p className="text-sm text-stone-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mb-10 p-6 bg-gradient-to-r from-amber-50/60 via-yellow-50/40 to-orange-50/30 backdrop-blur-xl border border-amber-200/30 rounded-2xl flex items-start gap-4 animate-fade-in-up" style={{ animationDelay: '320ms' }}>
          <div className="w-10 h-10 bg-amber-100/80 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles size={18} className="text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-900 mb-1.5">AI Hiring Insight</h3>
            <p className="text-sm text-amber-800/60 leading-relaxed">
              You have {newApplicants} new applications awaiting review.
              {avgFitScore >= 70
                ? ' The average fit score is strong — your job descriptions are attracting well-matched candidates.'
                : ' Consider refining job descriptions to attract more aligned candidates.'}
              {activeJobs[0] && ` Your top pipeline is the ${activeJobs[0].title} with ${activeJobs[0].applicantCount} applicants.`}
            </p>
          </div>
        </div>

        <div className="mb-10 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-foreground tracking-tight">Active Jobs</h2>
            <button onClick={() => router.push('/hiring/jobs/all')} className="text-sm text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 transition-colors">
              View all <ArrowRight size={14} />
            </button>
          </div>

          {activeJobs.length > 0 ? (
            <div className="grid grid-cols-2 gap-5">
              {activeJobs.map((job, i) => (
                <div key={job.id} className="animate-fade-in-up" style={{ animationDelay: `${480 + i * 80}ms` }}>
                  <JobCard job={job} basePath="/hiring" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white/50 backdrop-blur-xl border border-white/60 rounded-2xl">
              <Briefcase size={24} className="text-stone-400 mx-auto mb-3" />
              <p className="text-stone-500 mb-4">No jobs posted yet</p>
              <Button onClick={() => router.push('/hiring/jobs/new')}>
                <Plus size={14} className="mr-1.5" /> Post your first job
              </Button>
            </div>
          )}
        </div>

        {applications.length > 0 && (
          <div className="animate-fade-in-up" style={{ animationDelay: '640ms' }}>
            <h2 className="text-lg font-bold text-foreground mb-5 tracking-tight">Recent Applications</h2>
            <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-2xl divide-y divide-white/40 overflow-hidden">
              {applications
                .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
                .slice(0, 5)
                .map((app) => {
                  const job = jobs.find((j) => j.id === app.jobId);
                  return (
                    <button
                      key={app.id}
                      onClick={() => router.push(`/hiring/jobs/${app.jobId}`)}
                      className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/40 transition-all duration-200 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-amber-200/50">
                          {app.candidate?.name?.split(' ').map((n) => n[0]).join('') || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{app.candidate?.name || 'Unknown'}</p>
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
        )}
      </div>
    </div>
  );
}
