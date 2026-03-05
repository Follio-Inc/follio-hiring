'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CandidateApplicationCard } from '@/components/candidate/application-card';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { FitScoreRing } from '@/components/ui/fit-score';
import type { CandidateApplication } from '@/lib/candidate-types';
import { Briefcase, TrendingUp, Clock, Star, ArrowRight } from 'lucide-react';

export default function CandidateDashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/dashboard');
      return;
    }
    if (user) {
      fetch('/api/applications')
        .then((res) => res.json())
        .then((res) => {
          if (res.success && Array.isArray(res.data)) setApplications(res.data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isLoading, user, router]);

  if (isLoading || !user || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-stone-500">Loading...</p>
      </div>
    );
  }

  const avgFitScore = applications.length
    ? Math.round(applications.reduce((sum, a) => sum + (a.fitScore || 0), 0) / applications.length)
    : 0;

  const stageCount = (stage: string) => applications.filter((a) => a.stage === stage).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-800">My Applications</h1>
          <p className="text-stone-500 mt-1">Track your job applications</p>
        </div>
        <Link href="/jobs">
          <Button>Browse roles <ArrowRight className="w-4 h-4 ml-1" /></Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <GlassCard padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-800">{applications.length}</p>
              <p className="text-xs text-stone-500">Total applied</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-800">{stageCount('interview') + stageCount('shortlisted')}</p>
              <p className="text-xs text-stone-500">In progress</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-800">{stageCount('reviewing')}</p>
              <p className="text-xs text-stone-500">Under review</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard padding="md">
          <div className="flex items-center gap-3">
            <FitScoreRing score={avgFitScore} size="sm" showLabel={false} />
            <div>
              <p className="text-2xl font-bold text-stone-800">{avgFitScore}</p>
              <p className="text-xs text-stone-500">Avg fit score</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {applications.length > 0 ? (
        <div className="space-y-3">
          {applications.map((app) => (
            <CandidateApplicationCard key={app.id} application={app} />
          ))}
        </div>
      ) : (
        <GlassCard padding="lg" className="text-center py-16">
          <Star className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-stone-700 mb-2">No applications yet</h2>
          <p className="text-stone-500 mb-6">Start browsing open roles and find where you fit.</p>
          <Link href="/jobs">
            <Button>Browse open roles <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </Link>
        </GlassCard>
      )}
    </div>
  );
}
