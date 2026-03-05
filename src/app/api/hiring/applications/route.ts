import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

  const { data: membership } = await supabase
    .from('company_members')
    .select('company_id')
    .eq('user_id', user.id)
    .single();

  if (!membership) return NextResponse.json({ success: false, error: 'No company found' }, { status: 403 });

  const jobId = request.nextUrl.searchParams.get('jobId');

  let query = supabase
    .from('applications')
    .select('*, jobs!inner(id, company_id, title, role_type), profiles:candidate_id(id, name, email, avatar_url)')
    .eq('jobs.company_id', membership.company_id)
    .order('applied_at', { ascending: false });

  if (jobId) {
    query = query.eq('job_id', jobId);
  }

  const { data: apps, error } = await query;
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  const { data: candidateProfiles } = await supabase
    .from('candidate_profiles')
    .select('id, skills, location, experience_level');

  const cpMap = new Map((candidateProfiles || []).map((cp) => [cp.id, cp]));

  const mapped = (apps || []).map((app) => {
    const candidate = app.profiles as Record<string, string> | null;
    const cp = candidate ? cpMap.get(candidate.id) : null;

    return {
      id: app.id,
      jobId: app.job_id,
      candidateId: app.candidate_id,
      appliedAt: app.applied_at,
      stage: app.stage,
      fitScore: app.fit_score || 0,
      candidate: candidate
        ? {
            id: candidate.id,
            name: candidate.name,
            email: candidate.email,
            avatarUrl: candidate.avatar_url || '',
            roleType: (app.jobs as Record<string, string>)?.role_type || 'developer',
            title: `${cp?.experience_level || 'mid'}-level professional`,
            location: cp?.location || '',
            yearsOfExperience: cp?.experience_level === 'senior' ? 5 : cp?.experience_level === 'lead' ? 8 : 3,
            skills: cp?.skills || [],
            bio: '',
          }
        : null,
      aiSummary: {
        summary: `Candidate with fit score of ${app.fit_score || 0}`,
        strengths: ['Applied to position'],
        risks: [],
        missingRequirements: [],
        interviewFocusAreas: ['General assessment'],
      },
      notes: [],
      rating: 0,
    };
  });

  return NextResponse.json({ success: true, data: mapped });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

  const body = await request.json();
  const { applicationId, stage } = body;

  const { error } = await supabase
    .from('applications')
    .update({ stage })
    .eq('id', applicationId);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
