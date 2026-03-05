export interface CandidateProfile {
  id: string;
  email: string;
  name: string;
  location: string;
  experienceLevel: string;
  rolePreferences: string[];
  skills: string[];
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  resumeUrl?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export type LocationType = 'remote' | 'hybrid' | 'onsite';

export interface CandidateCompany {
  id: string;
  name: string;
  logo_url?: string;
  industry?: string;
  size?: string;
  description?: string;
  website?: string;
}

export interface CandidateJob {
  id: string;
  title: string;
  company: CandidateCompany;
  roleType: string;
  locationType: string;
  location: string;
  experienceLevel: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  description: string;
  requiredSkills: string[];
  mustHave: string[];
  niceToHave: string[];
  benefits: string[];
  status: string;
  createdAt: string;
}

export type CandidateApplicationStage =
  | 'new'
  | 'reviewing'
  | 'shortlisted'
  | 'interview'
  | 'offer'
  | 'rejected';

export interface CandidateApplication {
  id: string;
  candidateId: string;
  jobId: string;
  job: CandidateJob;
  coverNote: string;
  resumeUrl?: string;
  stage: CandidateApplicationStage;
  fitScore: number;
  appliedAt: string;
}

export interface FitScore {
  overall: number;
  strengths: { area: string; description: string; score: number }[];
  gaps: { area: string; description: string; score: number }[];
  recommendations: string[];
  summary: string;
}
