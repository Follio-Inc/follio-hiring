'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { ArrowRight, Sparkles, Building2, Users, BarChart3, Shield, Zap } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      router.push(user.role === 'recruiter' ? '/hiring/dashboard' : '/jobs');
    }
  }, [isAuthenticated, user, isLoading, router]);

  if (isLoading || (isAuthenticated && user)) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <div className="animate-pulse text-stone-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-amber-200/30 to-orange-100/20 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-sky-200/20 to-indigo-100/15 blur-3xl" />
        <div className="absolute top-[30%] left-[50%] w-[300px] h-[300px] rounded-full bg-gradient-to-r from-emerald-100/20 to-teal-100/15 blur-3xl" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Together" width={32} height={32} className="object-contain" />
          <span className="text-xl font-bold tracking-tight text-foreground">Together</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-foreground transition-colors">
            Sign in
          </Link>
          <Link href="/signup" className="px-5 py-2.5 text-sm font-semibold text-white bg-foreground rounded-xl hover:bg-stone-800 transition-colors">
            Get started
          </Link>
        </div>
      </nav>

      <main className="relative z-10">
        <section className={`max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-24 text-center transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200/60 mb-8">
            <Sparkles size={14} className="text-amber-600" />
            <span className="text-sm font-medium text-amber-700">AI-powered hiring platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight leading-[1.1] max-w-4xl mx-auto mb-6">
            Hiring that brings
            <span className="relative ml-3 inline-block">
              <span className="relative z-10">everyone</span>
              <span className="absolute bottom-2 left-0 right-0 h-3 bg-amber-300/40 rounded-sm -rotate-1" />
            </span>
            {' '}together
          </h1>

          <p className="text-lg md:text-xl text-stone-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            One platform for candidates to find their perfect role and for companies to discover exceptional talent — powered by AI fit scoring.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-foreground rounded-2xl hover:bg-stone-800 transition-all hover:shadow-xl hover:shadow-stone-900/10"
            >
              Find your next role
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/signup/company"
              className="group flex items-center gap-2 px-8 py-4 text-base font-semibold text-foreground bg-white/70 border border-stone-200 rounded-2xl hover:bg-white hover:border-stone-300 transition-all hover:shadow-lg hover:shadow-stone-200/40"
            >
              <Building2 size={18} />
              Hire with Together
            </Link>
          </div>
        </section>

        <section className={`max-w-7xl mx-auto px-6 lg:px-12 pb-24 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="group relative bg-gradient-to-br from-amber-50/80 to-orange-50/40 border border-amber-200/40 rounded-3xl p-8 lg:p-10 overflow-hidden hover:shadow-xl hover:shadow-amber-200/20 transition-all duration-500">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-amber-200/30 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mb-6">
                  <Users size={24} className="text-amber-700" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">For Candidates</h3>
                <p className="text-stone-500 mb-6 leading-relaxed">
                  Discover roles matched to your skills with AI-powered fit scores. Apply with confidence knowing exactly how well you match each position.
                </p>
                <ul className="space-y-3 mb-8">
                  {['AI-generated fit scores for every job', 'Smart skill matching & recommendations', 'Track all your applications in one place'].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-stone-600">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-amber-200/60 flex-shrink-0 flex items-center justify-center text-amber-800 text-xs">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 hover:text-amber-800 transition-colors group/link">
                  Start exploring jobs <ArrowRight size={14} className="transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-sky-50/80 to-indigo-50/40 border border-sky-200/40 rounded-3xl p-8 lg:p-10 overflow-hidden hover:shadow-xl hover:shadow-sky-200/20 transition-all duration-500">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-sky-200/30 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center mb-6">
                  <Building2 size={24} className="text-sky-700" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">For Companies</h3>
                <p className="text-stone-500 mb-6 leading-relaxed">
                  Set up your company dashboard in minutes. Post jobs, screen candidates with AI, and collaborate with your entire recruiting team.
                </p>
                <ul className="space-y-3 mb-8">
                  {['Multi-tenant company workspaces', 'Invite unlimited recruiters to your team', 'AI-powered candidate ranking & comparison'].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-stone-600">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-sky-200/60 flex-shrink-0 flex items-center justify-center text-sky-800 text-xs">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/signup/company" className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700 hover:text-sky-800 transition-colors group/link">
                  Register your company <ArrowRight size={14} className="transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className={`max-w-7xl mx-auto px-6 lg:px-12 pb-24 transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Together?</h2>
            <p className="text-stone-500 max-w-xl mx-auto">Built from the ground up to make hiring smarter, faster, and more human.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Sparkles, title: 'AI Fit Scoring', desc: 'Every application is automatically scored based on skill match, experience, and role fit.', bg: 'bg-amber-100', text: 'text-amber-600' },
              { icon: Shield, title: 'Secure & Isolated', desc: 'Each company workspace is fully isolated with row-level security. Your data stays yours.', bg: 'bg-emerald-100', text: 'text-emerald-600' },
              { icon: Users, title: 'Team Collaboration', desc: 'Invite your entire recruiting team. Everyone sees the same pipeline in real-time.', bg: 'bg-sky-100', text: 'text-sky-600' },
              { icon: BarChart3, title: 'Pipeline Analytics', desc: 'Track conversion rates, time-to-hire, and candidate quality across every stage.', bg: 'bg-violet-100', text: 'text-violet-600' },
              { icon: Zap, title: 'Lightning Fast', desc: 'Modern, responsive UI that loads instantly. No more waiting for dashboards to load.', bg: 'bg-orange-100', text: 'text-orange-600' },
              { icon: Building2, title: 'Multi-Tenant', desc: 'Each company gets their own branded workspace with custom settings and team roles.', bg: 'bg-rose-100', text: 'text-rose-600' },
            ].map(({ icon: Icon, title, desc, bg, text }) => (
              <div key={title} className="bg-white/50 backdrop-blur-sm border border-white/60 rounded-2xl p-6 hover:bg-white/70 hover:shadow-lg hover:shadow-stone-200/30 transition-all duration-300">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon size={20} className={text} />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={`max-w-7xl mx-auto px-6 lg:px-12 pb-24 transition-all duration-1000 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="relative bg-foreground rounded-3xl p-10 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-stone-800 to-stone-900" />
            <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-sky-500/10 rounded-full blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to get started?</h2>
              <p className="text-stone-400 max-w-lg mx-auto mb-8 leading-relaxed">
                Join thousands of candidates and companies using Together to find the perfect match.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="group inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-foreground bg-white rounded-2xl hover:bg-amber-50 transition-all"
                >
                  I&apos;m looking for a job
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/signup/company"
                  className="group inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white/90 border border-white/20 rounded-2xl hover:bg-white/10 transition-all"
                >
                  I&apos;m hiring
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-stone-200/60 py-8 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Together" width={20} height={20} className="object-contain opacity-60" />
            <span className="text-sm text-stone-400">Together &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-stone-400">
            <Link href="/jobs" className="hover:text-foreground transition-colors">Browse Jobs</Link>
            <Link href="/signup/company" className="hover:text-foreground transition-colors">For Companies</Link>
            <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
