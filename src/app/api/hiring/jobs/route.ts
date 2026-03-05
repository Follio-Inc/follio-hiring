import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

  const { data: membership } = await supabase
    .from('company_members')
    .select('company_id')
    .eq('user_id', user.id)
    .single();

  if (!membership) return NextResponse.json({ success: false, error: 'No company found' }, { status: 403 });

  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('company_id', membership.company_id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  const { data: appCounts } = await supabase
    .from('applications')
    .select('job_id, stage, fit_score');

  const countMap = new Map<string, { count: number; totalScore: number; stages: Record<string, number> }>();
  for (const app of appCounts || []) {
    if (!countMap.has(app.job_id)) {
      countMap.set(app.job_id, { count: 0, totalScore: 0, stages: {} });
    }
    const entry = countMap.get(app.job_id)!;
    entry.count++;
    entry.totalScore += app.fit_score || 0;
    entry.stages[app.stage] = (entry.stages[app.stage] || 0) + 1;
  }

  const mapped = (jobs || []).map((job) => {
    const stats = countMap.get(job.id);
    return {
      id: job.id,
      companyId: job.company_id,
      title: job.title,
      department: job.department || '',
      roleType: job.role_type,
      requiredSkills: job.required_skills || [],
      experienceLevel: job.experience_level || 'mid',
      description: job.description || '',
      mustHave: job.must_have || [],
      niceToHave: job.nice_to_have || [],
      createdAt: job.created_at,
      status: job.status,
      applicantCount: stats?.count || 0,
      avgFitScore: stats ? Math.round(stats.totalScore / stats.count) : 0,
      stageBreakdown: {
        new: stats?.stages?.new || 0,
        reviewing: stats?.stages?.reviewing || 0,
        shortlisted: stats?.stages?.shortlisted || 0,
        interview: stats?.stages?.interview || 0,
        offer: stats?.stages?.offer || 0,
        rejected: stats?.stages?.rejected || 0,
      },
      aiSnapshot: {
        idealCandidate: `Looking for a ${job.experience_level} ${job.role_type} with expertise in ${(job.required_skills || []).slice(0, 3).join(', ')}.`,
        evaluationCriteria: (job.must_have || []).slice(0, 5),
        keywords: (job.required_skills || []).map((s: string) => s.toLowerCase()),
      },
    };
  });

  return NextResponse.json({ success: true, data: mapped });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

  const { data: membership } = await supabase
    .from('company_members')
    .select('company_id')
    .eq('user_id', user.id)
    .single();

  if (!membership) return NextResponse.json({ success: false, error: 'No company found' }, { status: 403 });

  const body = await request.json();

  const { data: job, error } = await supabase
    .from('jobs')
    .insert({
      company_id: membership.company_id,
      created_by: user.id,
      title: body.title,
      department: body.department || null,
      role_type: body.roleType,
      required_skills: body.requiredSkills || [],
      experience_level: body.experienceLevel || 'mid',
      description: body.description || '',
      must_have: body.mustHave || [],
      nice_to_have: body.niceToHave || [],
      location: body.location || 'Remote',
      location_type: body.locationType || 'remote',
      salary_min: body.salaryMin || null,
      salary_max: body.salaryMax || null,
      currency: body.currency || 'USD',
      benefits: body.benefits || [],
      status: 'active',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: job }, { status: 201 });
}
