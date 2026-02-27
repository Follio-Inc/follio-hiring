'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { UserRole } from '@/lib/types';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('recruiter');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await signup(name, email, password, role);
      if (success) router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = 'w-full px-4 py-3 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all placeholder:text-stone-400';

  return (
    <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-8">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center gap-2 mb-10 justify-center">
          <Image
            src="/logo.png"
            alt="Together Logo"
            width={32}
            height={32}
            className="object-contain"
          />
          <span className="text-xl font-semibold text-foreground tracking-tight">Together</span>
        </div>

        <h2 className="text-[1.75rem] font-bold text-foreground mb-1 text-center tracking-tight">Create your account</h2>
        <p className="text-stone-400 mb-9 text-center">Start hiring smarter with AI</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClasses} placeholder="Jane Smith" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClasses} placeholder="you@company.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClasses} placeholder="Create a password" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Role</label>
            <select value={role} onChange={e => setRole(e.target.value as UserRole)} className={inputClasses}>
              <option value="recruiter">Recruiter</option>
              <option value="manager">Hiring Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <Button type="submit" className="w-full !py-3 !rounded-xl !text-[15px]" size="lg" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
            {!isLoading && <ArrowRight size={16} className="ml-2" />}
          </Button>
        </form>

        <p className="text-center text-sm text-stone-400 mt-8">
          Already have an account?{' '}
          <button onClick={() => router.push('/login')} className="text-amber-700 font-semibold hover:text-amber-800 transition-colors">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
