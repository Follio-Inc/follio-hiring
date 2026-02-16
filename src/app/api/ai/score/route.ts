import { NextResponse } from 'next/server';
import { computeFitScore, generateAIAssessment } from '@/lib/ai-scoring';
import { CandidateProfile, Job } from '@/lib/types';

/**
 * AI Scoring API
 *
 * POST /api/ai/score
 *
 * Request body:
 * {
 *   candidate: CandidateProfile,
 *   job: Job
 * }
 *
 * Returns fit score and AI assessment.
 */
export async function POST(request: Request) {
  try {
    const { candidate, job } = await request.json() as {
      candidate: CandidateProfile;
      job: Job;
    };

    if (!candidate || !job) {
      return NextResponse.json(
        { success: false, error: 'Missing candidate or job data' },
        { status: 400 }
      );
    }

    const fitScore = computeFitScore(candidate, job);
    const assessment = generateAIAssessment(candidate, job, fitScore);

    return NextResponse.json({
      success: true,
      data: {
        fitScore,
        assessment,
        scoringBreakdown: {
          skillMatch: Math.round(
            (candidate.skills.filter(s =>
              job.requiredSkills.some(rs =>
                rs.toLowerCase().includes(s.toLowerCase()) ||
                s.toLowerCase().includes(rs.toLowerCase())
              )
            ).length / Math.max(job.requiredSkills.length, 1)) * 100
          ),
          experienceMatch: candidate.yearsOfExperience >= 5 ? 90 : candidate.yearsOfExperience >= 3 ? 70 : 50,
          portfolioStrength: candidate.github ? 80 : candidate.designPortfolio ? 85 : candidate.pmProfile ? 75 : 50,
        },
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to compute score' },
      { status: 500 }
    );
  }
}
