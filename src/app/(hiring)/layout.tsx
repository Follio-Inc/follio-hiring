'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { HiringSidebar } from '@/components/hiring/sidebar';
import { AppProvider } from '@/contexts/app-context';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase-client';

function CompanyOnboarding() {
  const [companyName, setCompanyName] = useState('');
  const [saving, setSaving] = useState(false);
  const { user, refreshProfile } = useAuth();
  const supabase = createClient();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !user) return;
    setSaving(true);

    const { data: newCompany } = await supabase
      .from('companies')
      .insert({ name: companyName.trim() })
      .select()
      .single();

    if (newCompany) {
      await supabase.from('company_members').insert({
        company_id: newCompany.id,
        user_id: user.id,
        role: 'admin',
      });
      await refreshProfile();
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-8">
      <div className="w-full max-w-[420px] text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-6">
          <Building2 size={28} className="text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Set up your company</h2>
        <p className="text-stone-500 mb-8">
          Create your company workspace to start posting jobs and managing candidates.
        </p>
        <form onSubmit={handleCreate} className="space-y-4">
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Your company name"
            className="w-full px-4 py-3 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all placeholder:text-stone-400"
            required
          />
          <Button type="submit" className="w-full !py-3 !rounded-xl" isLoading={saving} disabled={!companyName.trim()}>
            Create company
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function HiringLayout({ children }: { children: React.ReactNode }) {
  const { user, company, isAuthenticated, isLoading } = useAuth();
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

  if (!company) {
    return <CompanyOnboarding />;
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
