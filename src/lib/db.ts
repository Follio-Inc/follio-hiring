import { createClient } from '@/lib/supabase-server';

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
}

export async function getCandidateProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('candidate_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
}

export async function getCompanyForUser(userId: string) {
  const supabase = await createClient();
  const { data: membership } = await supabase
    .from('company_members')
    .select('company_id, role, companies(*)')
    .eq('user_id', userId)
    .single();
  if (!membership) return null;
  return {
    company: membership.companies as unknown as Record<string, unknown>,
    memberRole: membership.role as string,
    companyId: membership.company_id as string,
  };
}

export async function getCompanyMembers(companyId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('company_members')
    .select('*, profiles(*)')
    .eq('company_id', companyId)
    .order('joined_at', { ascending: true });
  return data || [];
}

export async function getCompanyJobs(companyId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('jobs')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function getCompanyApplications(companyId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('applications')
    .select('*, jobs!inner(company_id), profiles:candidate_id(id, name, email, avatar_url)')
    .eq('jobs.company_id', companyId)
    .order('applied_at', { ascending: false });
  return data || [];
}

export async function getActiveJobs() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('jobs')
    .select('*, companies(id, name, logo_url, industry, size, description, website)')
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  return data || [];
}

export async function getCandidateApplications(candidateId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('applications')
    .select('*, jobs(*, companies(id, name, logo_url, industry, size, description, website))')
    .eq('candidate_id', candidateId)
    .order('applied_at', { ascending: false });
  return data || [];
}
