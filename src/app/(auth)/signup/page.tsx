'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await signup(name, email, password);
    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }
    router.push('/jobs');
  };

  const inputClasses =
    'w-full px-4 py-3 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all placeholder:text-stone-400';

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
            <label className="block text-sm font-medium text-foreground mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClasses} placeholder="Create a password (min 6 chars)" required minLength={6} />
          </div>

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          <Button type="submit" className="w-full !py-3 !rounded-xl !text-[15px]" size="lg" disabled={isLoading}>
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
