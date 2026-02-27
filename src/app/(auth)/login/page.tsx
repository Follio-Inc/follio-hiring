'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, Eye, EyeOff, Sparkles, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('sarah@together.dev');
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
    <div className="min-h-screen flex">
      {/* Left panel — warm dark branding */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-14"
        style={{
          background: 'linear-gradient(145deg, #0f0906 0%, #1a1008 40%, #120c05 70%, #0a0604 100%)',
        }}
      >
        {/* Dot grid texture */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Ambient gold glow */}
        <div
          className="absolute top-[10%] left-[35%] w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 65%)',
          }}
        />
        <div
          className="absolute bottom-[15%] right-[15%] w-[300px] h-[300px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(217, 119, 6, 0.08) 0%, transparent 60%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-24">
            <Image
              src="/logo.png"
              alt="Together Logo"
              width={34}
              height={34}
              className="object-contain opacity-90"
            />
            <span className="text-xl font-semibold text-white/80 tracking-tight">Together</span>
          </div>

          <h1 className="text-[3.5rem] font-bold text-white leading-[1.08] tracking-tight mb-6 max-w-lg">
            Hire smarter,{' '}
            <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent">
              together.
            </span>
          </h1>
          <p className="text-lg text-white/40 leading-relaxed max-w-md font-light">
            AI-powered candidate scoring, portfolio intelligence,
            and pipeline analytics — all in one place.
          </p>
        </div>

        <div className="relative z-10 space-y-5">
          {[
            { icon: Sparkles, text: 'AI fit scoring in seconds' },
            { icon: Users, text: 'Side-by-side candidate comparison' },
            { icon: Zap, text: 'Pipeline analytics & funnel insights' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-4 group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.15)' }}
              >
                <item.icon size={16} className="text-amber-400/80" />
              </div>
              <span className="text-white/40 text-[15px] font-light group-hover:text-white/60 transition-colors">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#faf9f6]">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <Image
              src="/logo.png"
              alt="Together Logo"
              width={32}
              height={32}
              className="object-contain"
            />
            <span className="text-xl font-semibold text-foreground tracking-tight">Together</span>
          </div>

          <h2 className="text-[1.75rem] font-bold text-foreground tracking-tight mb-1">Welcome back</h2>
          <p className="text-stone-400 mb-9">Sign in to your recruiter dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all placeholder:text-stone-400"
                placeholder="you@company.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all pr-11 placeholder:text-stone-400"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 font-medium">{error}</p>
            )}

            <Button type="submit" className="w-full !py-3 !rounded-xl !text-[15px]" size="lg" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
              {!isLoading && <ArrowRight size={16} className="ml-2" />}
            </Button>
          </form>

          <p className="text-center text-sm text-stone-400 mt-8">
            Don&apos;t have an account?{' '}
            <button
              onClick={() => router.push('/signup')}
              className="text-amber-700 font-semibold hover:text-amber-800 transition-colors"
            >
              Sign up
            </button>
          </p>

          <p className="text-center text-xs text-stone-400 mt-4">
            Demo mode — any credentials will work
          </p>
        </div>
      </div>
    </div>
  );
}
