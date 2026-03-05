import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
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
    return NextResponse.json({ success: false, error: 'Only candidates can apply' }, { status: 403 });
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

  const { data: job } = await supabase
    .from('jobs')
    .select('id')
    .eq('id', jobId)
    .eq('company_id', candidateProfile.company_id)
    .eq('status', 'active')
    .single();

  if (!job) {
    return NextResponse.json({ success: false, error: 'Job not found or not active' }, { status: 404 });
  }

  const body = await request.json();
  const fitScore = Math.floor(Math.random() * 40) + 55;

  const { data: application, error } = await supabase
    .from('applications')
    .insert({
      job_id: jobId,
      candidate_id: user.id,
      cover_note: body.coverNote || '',
      resume_url: body.resumeUrl || null,
      stage: 'new',
      fit_score: fitScore,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ success: false, error: 'You already applied to this job' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: application }, { status: 201 });
}
