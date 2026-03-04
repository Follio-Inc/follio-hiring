import { NextRequest, NextResponse } from 'next/server';
import { mockApplications, mockJobs } from '@/lib/mock-data';
import { getSharedApplications } from '@/lib/shared-store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get('jobId');

  let applications = [...mockApplications];

  try {
    const shared = await getSharedApplications(jobId ?? undefined, mockJobs);
    const existingIds = new Set(applications.map(a => a.id));
    for (const app of shared) {
      if (!existingIds.has(app.id)) {
        applications.push(app);
      }
    }
  } catch (err) {
    console.error('Failed to read shared applications:', err);
  }

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
