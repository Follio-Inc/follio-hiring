import { NextResponse } from 'next/server';
import { mockJobs, mockCompany } from '@/lib/mock-data';
import { saveJobToSharedStore, getSharedJobs } from '@/lib/shared-store';
import type { Job } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const allJobs = [...mockJobs];

  try {
    const shared = await getSharedJobs();
    const existingIds = new Set(allJobs.map(j => j.id));
    for (const job of shared) {
      if (!existingIds.has(job.id)) {
        allJobs.push(job);
      }
    }
  } catch (err) {
    console.error('Failed to read shared jobs:', err);
  }

  return NextResponse.json({
    success: true,
    data: allJobs,
    meta: {
      total: allJobs.length,
      active: allJobs.filter(j => j.status === 'active').length,
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  const newJob: Job = {
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

  try {
    await saveJobToSharedStore(newJob, mockCompany.name);
  } catch (err) {
    console.error('Failed to save job to shared store:', err);
  }

  return NextResponse.json({
    success: true,
    data: newJob,
  }, { status: 201 });
}
