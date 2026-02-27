'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { AppProvider } from '@/contexts/app-context';
import { useAuth } from '@/contexts/auth-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <div className="animate-pulse text-stone-400">Loading...</div>
      </div>
    );
  }

  return (
    <AppProvider>
      <div className="min-h-screen bg-[#faf9f6]">
        <Sidebar />
        <main className="ml-64">
          {children}
        </main>
      </div>
    </AppProvider>
  );
}
