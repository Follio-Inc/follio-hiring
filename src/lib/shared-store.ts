import { supabase } from './supabase';
import type { Job, Application, CandidateProfile, ApplicationStage } from './types';
import { computeFitScore, generateAIAssessment } from './ai-scoring';

export interface SharedJob {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  department: string;
  roleType: string;
  requiredSkills: string[];
  experienceLevel: string;
  description: string;
  mustHave: string[];
  niceToHave: string[];
  createdAt: string;
  status: string;
}

interface SharedApplicationRow {
  id: string;
  job_id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_skills: string[];
  candidate_location: string;
  candidate_experience: string;
  candidate_bio: string;
  candidate_resume_url: string;
  cover_note: string;
  applied_at: string;
}

interface SharedJobRow {
  id: string;
  company_id: string;
  company_name: string;
  title: string;
  department: string;
  role_type: string;
  required_skills: string[];
  experience_level: string;
  description: string;
  must_have: string[];
  nice_to_have: string[];
  created_at: string;
  status: string;
}

export async function saveJobToSharedStore(job: Job, companyName: string) {
  const { error } = await supabase.from('shared_jobs').upsert({
    id: job.id,
    company_id: job.companyId,
    company_name: companyName,
    title: job.title,
    department: job.department,
    role_type: job.roleType,
    required_skills: job.requiredSkills,
    experience_level: job.experienceLevel,
    description: job.description,
    must_have: job.mustHave,
    nice_to_have: job.niceToHave,
    created_at: job.createdAt,
    status: job.status,
  });

  if (error) {
    console.error('Supabase upsert shared_jobs error:', error);
    throw error;
  }
}

export async function getSharedApplications(jobId?: string, knownJobs?: Job[]): Promise<Application[]> {
  let query = supabase.from('shared_applications').select('*');
  if (jobId) {
    query = query.eq('job_id', jobId);
  }

  const { data: rows, error } = await query;
  if (error) {
    console.error('Supabase select shared_applications error:', error);
    return [];
  }
  if (!rows || rows.length === 0) return [];

  let sharedJobRows: SharedJobRow[] = [];
  const { data: jobRows } = await supabase.from('shared_jobs').select('*');
  if (jobRows) sharedJobRows = jobRows;

  return (rows as SharedApplicationRow[]).map(row => {
    const candidate: CandidateProfile = {
      id: `ext_${row.candidate_email.replace(/[^a-z0-9]/gi, '_')}`,
      name: row.candidate_name,
      email: row.candidate_email,
      avatarUrl: '',
      roleType: 'developer',
      title: row.candidate_experience,
      location: row.candidate_location,
      yearsOfExperience: 0,
      skills: row.candidate_skills ?? [],
      bio: row.candidate_bio,
      resumeUrl: row.candidate_resume_url,
    };

    const matchingJob = knownJobs?.find(j => j.id === row.job_id);
    const matchingSharedJob = sharedJobRows.find(j => j.id === row.job_id);

    const jobForScoring: Job = matchingJob ?? {
      id: row.job_id,
      companyId: matchingSharedJob?.company_id ?? 'comp_1',
      title: matchingSharedJob?.title ?? '',
      department: matchingSharedJob?.department ?? '',
      roleType: (matchingSharedJob?.role_type as Job['roleType']) ?? 'developer',
      requiredSkills: matchingSharedJob?.required_skills ?? [],
      experienceLevel: (matchingSharedJob?.experience_level as Job['experienceLevel']) ?? 'mid',
      description: matchingSharedJob?.description ?? '',
      mustHave: matchingSharedJob?.must_have ?? [],
      niceToHave: matchingSharedJob?.nice_to_have ?? [],
      createdAt: matchingSharedJob?.created_at ?? '',
      status: 'active',
      applicantCount: 0,
      avgFitScore: 0,
      stageBreakdown: { new: 0, reviewing: 0, shortlisted: 0, interview: 0, offer: 0, rejected: 0 },
    };

    const fitScore = computeFitScore(candidate, jobForScoring);
    const aiSummary = generateAIAssessment(candidate, jobForScoring, fitScore);

    return {
      id: row.id,
      jobId: row.job_id,
      candidateId: candidate.id,
      candidate,
      appliedAt: row.applied_at,
      stage: 'new' as ApplicationStage,
      fitScore,
      aiSummary,
      notes: [],
      rating: 0,
    };
  });
}
