import { NextRequest, NextResponse } from 'next/server';
import { mockApplications } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get('jobId');

  let applications = mockApplications;

  if (jobId) {
    applications = applications.filter(a => a.jobId === jobId);
  }

  return NextResponse.json({
    success: true,
    data: applications,
    meta: {
      total: applications.length,
    },
  });
}
