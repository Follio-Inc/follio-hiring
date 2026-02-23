import { NextRequest, NextResponse } from 'next/server';
import { mockJobs, mockApplications } from '@/lib/mock-data';
import { computeJobAnalytics } from '@/lib/analytics';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  const { searchParams } = new URL(request.url);
  const period =
    (searchParams.get('period') as 'all' | '30d' | '7d') || 'all';

  const job = mockJobs.find((j) => j.id === jobId);
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  const applications = mockApplications.filter((a) => a.jobId === jobId);
  const analytics = computeJobAnalytics(job, applications, period);

  return NextResponse.json(analytics);
}
