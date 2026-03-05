'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';

export default function CompanySignupPage() {
  const router = useRouter();
  const { signupCompany } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await signupCompany({ name, email, password, companyName });
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
    router.push('/hiring/dashboard');
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
            Click the link in the email to activate your account and access your company dashboard.
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
      <div className="w-full max-w-[440px]">
        <div className="flex items-center gap-2 mb-10 justify-center">
          <Image src="/logo.png" alt="Together Logo" width={32} height={32} className="object-contain" />
          <span className="text-xl font-semibold text-foreground tracking-tight">Together</span>
        </div>

        <div className="flex items-center gap-3 justify-center mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Building2 size={20} className="text-amber-600" />
          </div>
          <h2 className="text-[1.75rem] font-bold text-foreground tracking-tight">
            Start hiring
          </h2>
        </div>
        <p className="text-stone-400 mb-9 text-center">
          Register your company and start posting jobs
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/30 space-y-4">
            <h3 className="text-sm font-semibold text-amber-900">Company Details</h3>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className={inputClasses}
                placeholder="Acme Inc."
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-stone-700">Admin Account</h3>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Your Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} placeholder="Jane Smith" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Work Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} placeholder="you@company.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClasses} placeholder="Create a password" required minLength={6} />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          <Button type="submit" className="w-full !py-3 !rounded-xl !text-[15px]" size="lg" disabled={isLoading}>
            {isLoading ? 'Creating company...' : 'Create company account'}
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
            Looking for a job?{' '}
            <button onClick={() => router.push('/signup')} className="text-amber-700 font-semibold hover:text-amber-800 transition-colors">
              Sign up as candidate
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
