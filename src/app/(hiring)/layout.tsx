'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { HiringSidebar } from '@/components/hiring/sidebar';
import { AppProvider } from '@/contexts/app-context';
import { useAuth } from '@/contexts/auth-context';

export default function HiringLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
    if (!isLoading && user && user.role !== 'recruiter') {
      router.push('/jobs');
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading || !isAuthenticated || !user || user.role !== 'recruiter') {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <div className="animate-pulse text-stone-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <AppProvider>
      <div className="min-h-screen bg-[#faf9f6] relative">
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-5%] left-[10%] w-[600px] h-[600px] rounded-full opacity-[0.06]" style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />
          <div className="absolute top-[40%] right-[5%] w-[500px] h-[500px] rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, #d97706 0%, transparent 70%)' }} />
          <div className="absolute bottom-[-10%] left-[30%] w-[700px] h-[700px] rounded-full opacity-[0.03]" style={{ background: 'radial-gradient(circle, #eab308 0%, transparent 70%)' }} />
        </div>

        <HiringSidebar />
        <main className="ml-64 relative z-10">{children}</main>
      </div>
    </AppProvider>
  );
}
