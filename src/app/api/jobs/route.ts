import { NextResponse } from 'next/server';
import { mockJobs } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: mockJobs,
    meta: {
      total: mockJobs.length,
      active: mockJobs.filter(j => j.status === 'active').length,
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  const newJob = {
    id: `job_${Date.now()}`,
    companyId: 'comp_1',
    createdAt: new Date().toISOString(),
    applicantCount: 0,
    avgFitScore: 0,
    stageBreakdown: {
      new: 0,
      reviewing: 0,
      shortlisted: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
    },
    ...body,
  };

  return NextResponse.json({
    success: true,
    data: newJob,
  }, { status: 201 });
}
