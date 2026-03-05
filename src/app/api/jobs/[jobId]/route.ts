import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(_request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'candidate') {
    return NextResponse.json({ success: false, error: 'Only candidates can view jobs' }, { status: 403 });
  }

  const { data: candidateProfile } = await supabase
    .from('candidate_profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!candidateProfile?.company_id) {
    return NextResponse.json(
      { success: false, error: 'No company is selected for your candidate profile.' },
      { status: 400 },
    );
  }

  const { data: job, error } = await supabase
    .from('jobs')
    .select('*, companies(id, name, logo_url, industry, size, description, website)')
    .eq('id', jobId)
    .eq('company_id', candidateProfile.company_id)
    .single();

  if (error || !job) {
    return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
  }

  const mapped = {
    id: job.id,
    title: job.title,
    company: job.companies
      ? {
          id: job.companies.id,
          name: job.companies.name,
          logo_url: job.companies.logo_url,
          industry: job.companies.industry,
          size: job.companies.size,
          description: job.companies.description,
          website: job.companies.website,
        }
      : { id: job.company_id, name: 'Unknown' },
    roleType: job.role_type,
    locationType: job.location_type || 'remote',
    location: job.location || 'Remote',
    experienceLevel: job.experience_level || 'mid',
    salaryMin: job.salary_min,
    salaryMax: job.salary_max,
    currency: job.currency || 'USD',
    description: job.description || '',
    requiredSkills: job.required_skills || [],
    mustHave: job.must_have || [],
    niceToHave: job.nice_to_have || [],
    benefits: job.benefits || [],
    status: job.status,
    createdAt: job.created_at,
  };

  return NextResponse.json({ success: true, data: mapped });
}
