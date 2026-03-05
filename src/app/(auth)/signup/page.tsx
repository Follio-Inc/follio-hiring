'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';

interface CompanyOption {
  id: string;
  name: string;
}

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    fetch('/api/companies')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setCompanies(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingCompanies(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) {
      setError('Please select a company.');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await signup(name, email, password, companyId);
    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }
    if (result.needsConfirmation) {
      setShowConfirmation(true);
      setIsLoading(false);
      return;
    }
    router.push('/jobs');
  };

  const inputClasses =
    'w-full px-4 py-3 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all placeholder:text-stone-400';

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-8">
        <div className="w-full max-w-[420px] text-center">
          <Image src="/logo.png" alt="Together Logo" width={40} height={40} className="object-contain mx-auto mb-6" />
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">✉️</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Check your email</h2>
          <p className="text-stone-500 mb-2">
            We sent a verification link to <span className="font-semibold text-foreground">{email}</span>
          </p>
          <p className="text-sm text-stone-400 mb-8">
            Click the link in the email to activate your account and start browsing jobs.
          </p>
          <button onClick={() => router.push('/login')} className="text-sm text-amber-700 font-semibold hover:text-amber-800 transition-colors">
            Go to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-8">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center gap-2 mb-10 justify-center">
          <Image src="/logo.png" alt="Together Logo" width={32} height={32} className="object-contain" />
          <span className="text-xl font-semibold text-foreground tracking-tight">Together</span>
        </div>

        <h2 className="text-[1.75rem] font-bold text-foreground mb-1 text-center tracking-tight">
          Create your account
        </h2>
        <p className="text-stone-400 mb-9 text-center">
          Start finding roles where you&apos;re a fit
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} placeholder="Jane Smith" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} placeholder="you@example.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Company</label>
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className={inputClasses}
              required
              disabled={loadingCompanies || companies.length === 0}
            >
              <option value="">
                {loadingCompanies ? 'Loading companies...' : companies.length === 0 ? 'No companies available' : 'Select a company'}
              </option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClasses} placeholder="Create a password (min 6 chars)" required minLength={6} />
          </div>

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          <Button type="submit" className="w-full !py-3 !rounded-xl !text-[15px]" size="lg" disabled={isLoading || loadingCompanies || companies.length === 0}>
            {isLoading ? 'Creating account...' : 'Create account'}
            {!isLoading && <ArrowRight size={16} className="ml-2" />}
          </Button>
        </form>

        <div className="mt-8 space-y-3 text-center">
          <p className="text-sm text-stone-400">
            Already have an account?{' '}
            <button onClick={() => router.push('/login')} className="text-amber-700 font-semibold hover:text-amber-800 transition-colors">
              Sign in
            </button>
          </p>
          <p className="text-sm text-stone-400">
            Want to hire instead?{' '}
            <button onClick={() => router.push('/signup/company')} className="text-amber-700 font-semibold hover:text-amber-800 transition-colors">
              Register your company
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
