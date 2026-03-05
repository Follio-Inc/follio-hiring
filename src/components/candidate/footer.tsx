import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function CandidateFooter() {
  return (
    <footer className="border-t border-white/40 bg-[#faf9f6]/50 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-stone-800">Together</span>
            </Link>
            <p className="mt-3 text-sm text-stone-500 leading-relaxed">
              Find roles where you&apos;re actually a fit. AI-powered matching that works for you.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-stone-700 mb-3">For Candidates</h4>
            <ul className="space-y-2">
              <li><Link href="/jobs" className="text-sm text-stone-500 hover:text-amber-600 transition-colors">Browse Jobs</Link></li>
              <li><Link href="/dashboard" className="text-sm text-stone-500 hover:text-amber-600 transition-colors">My Applications</Link></li>
              <li><Link href="/profile" className="text-sm text-stone-500 hover:text-amber-600 transition-colors">My Profile</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-stone-700 mb-3">For Companies</h4>
            <ul className="space-y-2">
              <li><Link href="/signup/company" className="text-sm text-stone-500 hover:text-amber-600 transition-colors">Start Hiring</Link></li>
              <li><Link href="/login" className="text-sm text-stone-500 hover:text-amber-600 transition-colors">Recruiter Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-stone-700 mb-3">Legal</h4>
            <ul className="space-y-2">
              <li><span className="text-sm text-stone-500">Privacy</span></li>
              <li><span className="text-sm text-stone-500">Terms</span></li>
              <li><span className="text-sm text-stone-500">Cookie Policy</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-200/50 mt-8 pt-8 text-center">
          <p className="text-xs text-stone-400">&copy; {new Date().getFullYear()} Together. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
