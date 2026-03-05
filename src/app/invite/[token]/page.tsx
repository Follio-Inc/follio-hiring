'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, Building2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase-client';

interface InvitationData {
  id: string;
  email: string;
  role: string;
  company_id: string;
  companies: { name: string };
  accepted_at: string | null;
}

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase
      .from('invitations')
      .select('id, email, role, company_id, companies(name), accepted_at')
      .eq('token', token)
      .single()
      .then((result: { data: InvitationData | null; error: unknown }) => {
        if (result.error || !result.data) {
          setError('Invalid or expired invitation link.');
        } else if (result.data.accepted_at) {
          setError('This invitation has already been accepted.');
        } else {
          setInvitation(result.data);
        }
        setLoading(false);
      });
  }, [token, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation || !name.trim() || !password) return;
    setSubmitting(true);
    setError('');

    const { error: signupError } = await supabase.auth.signUp({
      email: invitation.email,
      password,
      options: { data: { name: name.trim(), role: 'recruiter' } },
    });

    if (signupError) {
      setError(signupError.message);
      setSubmitting(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Account created but failed to sign in. Please log in manually.');
      setSubmitting(false);
      return;
    }

    const { error: addMemberError } = await supabase.from('company_members').insert({
      company_id: invitation.company_id,
      user_id: user.id,
      role: invitation.role,
      invited_by: null,
    });

    if (addMemberError) {
      setError(addMemberError.message);
      setSubmitting(false);
      return;
    }

    const { error: markAcceptedError } = await supabase
      .from('invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invitation.id)
      .is('accepted_at', null);

    if (markAcceptedError) {
      setError(markAcceptedError.message);
      setSubmitting(false);
      return;
    }

    router.push('/hiring/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <p className="text-stone-400 animate-pulse">Loading invitation...</p>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-8">
        <div className="w-full max-w-[400px] text-center">
          <Image src="/logo.png" alt="Together Logo" width={40} height={40} className="object-contain mx-auto mb-6" />
          <h2 className="text-xl font-bold text-foreground mb-2">Invalid Invitation</h2>
          <p className="text-stone-400 mb-6">{error}</p>
          <Button onClick={() => router.push('/login')}>Go to login</Button>
        </div>
      </div>
    );
  }

  if (!invitation) return null;

  const inputClasses = 'w-full px-4 py-3 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all placeholder:text-stone-400';

  return (
    <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-8">
      <div className="w-full max-w-[420px]">
        <div className="flex items-center gap-2 mb-10 justify-center">
          <Image src="/logo.png" alt="Together Logo" width={32} height={32} className="object-contain" />
          <span className="text-xl font-semibold text-foreground tracking-tight">Together</span>
        </div>

        <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Building2 size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{invitation.companies.name}</p>
              <p className="text-xs text-stone-400">Invited you as {invitation.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/30">
            <UserPlus size={14} className="text-emerald-600" />
            <span className="text-sm text-emerald-700">{invitation.email}</span>
          </div>
        </div>

        <h2 className="text-[1.75rem] font-bold text-foreground mb-1 text-center tracking-tight">Join the team</h2>
        <p className="text-stone-400 mb-8 text-center">Create your account to get started</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Your Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} placeholder="Jane Smith" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <input type="email" value={invitation.email} className={`${inputClasses} bg-stone-50 text-stone-500`} disabled />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClasses} placeholder="Create a password" required minLength={6} />
          </div>

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          <Button type="submit" className="w-full !py-3 !rounded-xl !text-[15px]" size="lg" isLoading={submitting} disabled={!name.trim()}>
            {submitting ? 'Creating account...' : 'Join team'}
            {!submitting && <ArrowRight size={16} className="ml-2" />}
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
