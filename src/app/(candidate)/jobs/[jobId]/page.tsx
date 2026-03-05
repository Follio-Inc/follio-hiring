'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { TextArea } from '@/components/ui/input';
import { FitScoreRing } from '@/components/ui/fit-score';
import { formatSalary, formatRelativeDate, formatFullDate } from '@/lib/utils';
import type { CandidateJob } from '@/lib/candidate-types';
import {
  MapPin,
  Building2,
  DollarSign,
  Clock,
  Users,
  Globe,
  Briefcase,
  CheckCircle2,
  ArrowLeft,
  Send,
  Lock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export default function JobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [job, setJob] = useState<CandidateJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`/api/jobs/${jobId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) setJob(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [jobId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-lg text-stone-500">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-stone-800">Role not found</h1>
        <p className="text-stone-500 mt-2">This job posting may have been removed.</p>
        <Link href="/jobs" className="mt-4 inline-block">
          <Button variant="secondary">Browse all roles</Button>
        </Link>
      </div>
    );
  }

  const salary = formatSalary(job.salaryMin, job.salaryMax, job.currency);

  const handleApply = async () => {
    if (!user) {
      router.push(`/login?redirect=/jobs/${jobId}`);
      return;
    }
    if (!showApplyForm) {
      setShowApplyForm(true);
      return;
    }
    if (!coverNote.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverNote }),
      });
      const data = await res.json();
      if (data.success) setSubmitted(true);
    } catch {
      // handle error
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24">
        <GlassCard variant="strong" padding="lg" className="text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 border border-emerald-200/50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-stone-800 mb-2">Application submitted!</h1>
          <p className="text-stone-500 mb-6">
            You applied to <span className="font-medium text-stone-700">{job.title}</span> at{' '}
            <span className="font-medium text-stone-700">{job.company.name}</span>
          </p>
          <p className="text-sm text-stone-400 mb-6">Applied on {formatFullDate(new Date().toISOString())}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/dashboard">
              <Button>
                View my applications <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="/jobs">
              <Button variant="secondary">Browse more roles</Button>
            </Link>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to all roles
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard variant="strong" padding="lg">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-200/50 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-7 h-7 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-stone-800">{job.title}</h1>
                <p className="text-lg text-stone-500 mt-1">{job.company.name}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-stone-500">
                  <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>
                  {salary && <span className="inline-flex items-center gap-1"><DollarSign className="w-4 h-4" />{salary}</span>}
                  <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" />Posted {formatRelativeDate(job.createdAt)}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {job.requiredSkills.map((skill) => (
                    <span key={skill} className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-stone-100 text-stone-600">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>

          {job.description && (
            <GlassCard padding="lg">
              <h2 className="text-lg font-semibold text-stone-800 mb-3">About this role</h2>
              <p className="text-stone-600 leading-relaxed">{job.description}</p>
            </GlassCard>
          )}

          {job.mustHave.length > 0 && (
            <GlassCard padding="lg">
              <h2 className="text-lg font-semibold text-stone-800 mb-3">Requirements</h2>
              <ul className="space-y-2">
                {job.mustHave.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-stone-600">
                    <Briefcase className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              {job.niceToHave.length > 0 && (
                <>
                  <h3 className="text-sm font-semibold text-stone-700 mt-5 mb-2">Nice to have</h3>
                  <ul className="space-y-2">
                    {job.niceToHave.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-stone-500">
                        <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </GlassCard>
          )}

          {job.benefits.length > 0 && (
            <GlassCard padding="lg">
              <h2 className="text-lg font-semibold text-stone-800 mb-3">Benefits & Perks</h2>
              <ul className="space-y-2">
                {job.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-stone-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          )}

          {job.company.description && (
            <GlassCard padding="lg">
              <h2 className="text-lg font-semibold text-stone-800 mb-3">About {job.company.name}</h2>
              <p className="text-stone-600 leading-relaxed mb-3">{job.company.description}</p>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-stone-500">
                {job.company.size && (
                  <span className="inline-flex items-center gap-1.5"><Users className="w-4 h-4" />{job.company.size} employees</span>
                )}
                {job.company.industry && (
                  <span className="inline-flex items-center gap-1.5"><Globe className="w-4 h-4" />{job.company.industry}</span>
                )}
              </div>
            </GlassCard>
          )}
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <GlassCard variant="strong" padding="lg">
            {!showApplyForm ? (
              <div className="space-y-4">
                <Button fullWidth size="lg" onClick={handleApply}>
                  <Send className="w-4 h-4 mr-1" />
                  {user ? 'Apply now' : 'Sign in to apply'}
                </Button>
                {!user && (
                  <p className="text-xs text-center text-stone-400">Create a free account to apply</p>
                )}
              </div>
            ) : (
              <div className="space-y-4 animate-slide-up">
                <h3 className="font-semibold text-stone-800">Apply to {job.title}</h3>
                <TextArea
                  label="Why are you a great fit?"
                  placeholder="Tell the hiring team why you're excited about this role..."
                  rows={5}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setShowApplyForm(false)} className="flex-1">Cancel</Button>
                  <Button onClick={handleApply} isLoading={submitting} disabled={!coverNote.trim()} className="flex-1">Submit</Button>
                </div>
              </div>
            )}
          </GlassCard>

          {!user && (
            <GlassCard padding="lg" variant="subtle">
              <div className="text-center py-2">
                <Lock className="w-8 h-8 text-stone-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-stone-600 mb-1">See your personal fit score</p>
                <p className="text-xs text-stone-400 mb-4">
                  Sign in and complete your profile to unlock AI-powered fit scores.
                </p>
                <Link href="/signup">
                  <Button size="sm" variant="outline">Create free profile</Button>
                </Link>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
