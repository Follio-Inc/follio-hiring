'use client';

import { CandidateNavbar } from '@/components/candidate/navbar';
import { CandidateFooter } from '@/components/candidate/footer';
import { AmbientBackground } from '@/components/ui/ambient-background';

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6]">
      <AmbientBackground />
      <CandidateNavbar />
      <main className="flex-1">{children}</main>
      <CandidateFooter />
    </div>
  );
}
