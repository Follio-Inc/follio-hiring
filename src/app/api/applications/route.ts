import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
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

  if (profile?.role === 'candidate') {
    const { data: apps, error } = await supabase
      .from('applications')
      .select('*, jobs(*, companies(id, name, logo_url, industry, size, description, website))')
      .eq('candidate_id', user.id)
      .order('applied_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const mapped = (apps || []).map((app) => ({
      id: app.id,
      candidateId: app.candidate_id,
      jobId: app.job_id,
      job: app.jobs
        ? {
            id: app.jobs.id,
            title: app.jobs.title,
            company: app.jobs.companies
              ? {
                  id: app.jobs.companies.id,
                  name: app.jobs.companies.name,
                  logo_url: app.jobs.companies.logo_url,
                  industry: app.jobs.companies.industry,
                }
              : { id: app.jobs.company_id, name: 'Unknown' },
            roleType: app.jobs.role_type,
            locationType: app.jobs.location_type || 'remote',
            location: app.jobs.location || 'Remote',
            experienceLevel: app.jobs.experience_level || 'mid',
            salaryMin: app.jobs.salary_min,
            salaryMax: app.jobs.salary_max,
            currency: app.jobs.currency || 'USD',
            description: app.jobs.description || '',
            requiredSkills: app.jobs.required_skills || [],
            mustHave: app.jobs.must_have || [],
            niceToHave: app.jobs.nice_to_have || [],
            benefits: app.jobs.benefits || [],
            status: app.jobs.status,
            createdAt: app.jobs.created_at,
          }
        : null,
      coverNote: app.cover_note,
      resumeUrl: app.resume_url,
      stage: app.stage,
      fitScore: app.fit_score || 0,
      appliedAt: app.applied_at,
    }));

    return NextResponse.json({ success: true, data: mapped });
  }

  return NextResponse.json({ success: false, error: 'Use /api/hiring/applications for recruiter data' }, { status: 403 });
}
