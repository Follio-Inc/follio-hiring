'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('sarah@folio.dev');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (success) {
        router.push('/dashboard');
      }
    } catch {
      setError('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — branding (matches Folio purple gradient) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-purple-600 to-violet-800 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-16">
            <Image
              src="/logo.png"
              alt="Follio Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="text-2xl font-semibold text-white">Follio</span>
            <span className="text-sm font-medium text-violet-200 mt-1">Hire</span>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            AI-powered hiring<br />intelligence
          </h1>
          <p className="text-lg text-violet-200 leading-relaxed max-w-md">
            Screen candidates faster with AI-generated fit scores, adaptive portfolios,
            and intelligent comparison tools. Reduce screening time by 50%.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-violet-100">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-sm">1</div>
            <span>Post jobs with AI-enhanced descriptions</span>
          </div>
          <div className="flex items-center gap-3 text-violet-100">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-sm">2</div>
            <span>Review candidates with AI fit scoring</span>
          </div>
          <div className="flex items-center gap-3 text-violet-100">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-sm">3</div>
            <span>Compare and shortlist in minutes, not hours</span>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
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

          <h2 className="text-2xl font-bold text-foreground mb-1">Welcome back</h2>
          <p className="text-muted-foreground mb-8">Sign in to your recruiter dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="you@company.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent pr-10"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
              {!isLoading && <ArrowRight size={16} className="ml-2" />}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account?{' '}
            <button
              onClick={() => router.push('/signup')}
              className="text-violet-600 font-medium hover:text-violet-700"
            >
              Sign up
            </button>
          </p>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Demo mode — any credentials will work
          </p>
        </div>
      </div>
    </div>
  );
}
