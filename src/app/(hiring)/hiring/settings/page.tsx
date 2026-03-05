'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase-client';
import { Mail, Plus, Copy, Check, Users, Building2, Crown, UserCheck } from 'lucide-react';

interface TeamMember {
  id: string;
  role: string;
  joined_at: string;
  profiles: { id: string; name: string; email: string; avatar_url: string | null };
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  token: string;
  accepted_at: string | null;
  created_at: string;
}

export default function SettingsPage() {
  const { company, companyRole } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('recruiter');
  const [sending, setSending] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!company) return;

    supabase
      .from('company_members')
      .select('id, role, joined_at, profiles(id, name, email, avatar_url)')
      .eq('company_id', company.id)
      .order('joined_at', { ascending: true })
      .then(({ data }: { data: unknown }) => {
        if (data) setMembers(data as TeamMember[]);
      });

    supabase
      .from('invitations')
      .select('*')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false })
      .then(({ data }: { data: unknown }) => {
        if (data) setInvitations(data as Invitation[]);
      });
  }, [company, supabase]);

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !company) return;
    setSending(true);

    const { data, error } = await supabase
      .from('invitations')
      .insert({
        company_id: company.id,
        email: inviteEmail.trim(),
        role: inviteRole,
        invited_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (!error && data) {
      setInvitations([data as Invitation, ...invitations]);
      setInviteEmail('');
    }
    setSending(false);
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const isAdmin = companyRole === 'admin';

  return (
    <div>
      <Header title="Settings" subtitle="Manage your company and team" />

      <div className="p-8 max-w-4xl space-y-8">
        <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Building2 size={20} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{company?.name || 'Your Company'}</h2>
              <p className="text-sm text-stone-400">Company details</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-500 mb-1">Company Name</label>
              <p className="text-sm text-foreground">{company?.name}</p>
            </div>
            {company?.domain && (
              <div>
                <label className="block text-sm font-medium text-stone-500 mb-1">Domain</label>
                <p className="text-sm text-foreground">{company.domain}</p>
              </div>
            )}
            {company?.industry && (
              <div>
                <label className="block text-sm font-medium text-stone-500 mb-1">Industry</label>
                <p className="text-sm text-foreground">{company.industry}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
              <Users size={20} className="text-sky-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Team Members</h2>
              <p className="text-sm text-stone-400">{members.length} member{members.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="divide-y divide-white/40">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={member.profiles.name} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{member.profiles.name}</p>
                    <p className="text-xs text-stone-400">{member.profiles.email}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700">
                  {member.role === 'admin' ? <Crown size={12} /> : <UserCheck size={12} />}
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {isAdmin && (
          <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Mail size={20} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Invite Recruiters</h2>
                <p className="text-sm text-stone-400">Send invite links to add team members</p>
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="flex-1 px-4 py-2.5 text-sm bg-white/50 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 placeholder:text-stone-400"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="px-3 py-2.5 text-sm bg-white/50 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              >
                <option value="recruiter">Recruiter</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
              <Button onClick={handleInvite} isLoading={sending} disabled={!inviteEmail.trim()}>
                <Plus size={14} className="mr-1" /> Invite
              </Button>
            </div>

            {invitations.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-stone-500">Pending Invitations</h3>
                {invitations.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-white/30">
                    <div>
                      <p className="text-sm text-foreground">{inv.email}</p>
                      <p className="text-xs text-stone-400">
                        {inv.accepted_at ? 'Accepted' : 'Pending'} · {inv.role}
                      </p>
                    </div>
                    {!inv.accepted_at && (
                      <button
                        onClick={() => copyInviteLink(inv.token)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/50 text-stone-600 hover:bg-white/70 transition-all"
                      >
                        {copiedToken === inv.token ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        {copiedToken === inv.token ? 'Copied!' : 'Copy link'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
