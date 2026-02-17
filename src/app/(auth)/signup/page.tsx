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

  const inputClasses = 'w-full px-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <Image
            src="/logo.png"
            alt="Follio Logo"
            width={32}
            height={32}
            className="object-contain"
          />
          <span className="text-xl font-semibold bg-gradient-to-r from-violet-600 to-violet-400 bg-clip-text text-transparent">Follio</span>
          <span className="text-xs font-medium text-muted-foreground mt-0.5">Hire</span>
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-1 text-center">Create your account</h2>
        <p className="text-muted-foreground mb-8 text-center">Start hiring smarter with AI</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className={inputClasses}
              placeholder="Jane Smith"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={inputClasses}
              placeholder="you@company.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={inputClasses}
              placeholder="Create a password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as UserRole)}
              className={inputClasses}
            >
              <option value="recruiter">Recruiter</option>
              <option value="manager">Hiring Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
            {!isLoading && <ArrowRight size={16} className="ml-2" />}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <button
            onClick={() => router.push('/login')}
            className="text-violet-600 font-medium hover:text-violet-700"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
