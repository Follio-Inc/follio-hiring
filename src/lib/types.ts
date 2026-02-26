// ============================================================
// Core Data Models for Together Hiring Platform
// ============================================================

export type UserRole = 'recruiter' | 'manager' | 'admin';
export type RoleType = 'developer' | 'designer' | 'pm' | 'custom';
export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'lead' | 'principal';

export type ApplicationStage =
  | 'new'
  | 'reviewing'
  | 'shortlisted'
  | 'interview'
  | 'offer'
  | 'rejected';

export const STAGE_CONFIG: Record<ApplicationStage, { label: string; color: string; bgColor: string }> = {
  new: { label: 'New', color: 'text-violet-700', bgColor: 'bg-violet-50 border-violet-200' },
  reviewing: { label: 'Reviewing', color: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-200' },
  shortlisted: { label: 'Shortlisted', color: 'text-emerald-700', bgColor: 'bg-emerald-50 border-emerald-200' },
  interview: { label: 'Interview', color: 'text-indigo-700', bgColor: 'bg-indigo-50 border-indigo-200' },
  offer: { label: 'Offer', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200' },
  rejected: { label: 'Rejected', color: 'text-red-700', bgColor: 'bg-red-50 border-red-200' },
};

export const STAGE_ORDER: ApplicationStage[] = [
  'new', 'reviewing', 'shortlisted', 'interview', 'offer', 'rejected'
];

// ---------- User & Company ----------

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
  avatarUrl?: string;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  domain: string;
}

// ---------- Job ----------

export interface Job {
  id: string;
  companyId: string;
  title: string;
  department: string;
  roleType: RoleType;
  requiredSkills: string[];
  experienceLevel: ExperienceLevel;
  description: string;
  mustHave: string[];
  niceToHave: string[];
  createdAt: string;
  status: 'active' | 'paused' | 'closed';
  aiSnapshot?: JobAISnapshot;
  applicantCount: number;
  avgFitScore: number;
  stageBreakdown: Record<ApplicationStage, number>;
}

export interface JobAISnapshot {
  idealCandidate: string;
  evaluationCriteria: string[];
  keywords: string[];
}

// ---------- Candidate & Application ----------

export interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  roleType: RoleType;
  title: string;
  location: string;
  yearsOfExperience: number;
  skills: string[];
  bio: string;
  portfolioUrl?: string;
  resumeUrl?: string;

  // Developer-specific
  github?: GitHubProfile;

  // Designer-specific
  designPortfolio?: DesignPortfolio;

  // PM-specific
  pmProfile?: PMProfile;
}

export interface GitHubProfile {
  username: string;
  repos: number;
  stars: number;
  contributions: number;
  topLanguages: string[];
  topProjects: { name: string; description: string; stars: number; language: string }[];
  activityData: number[]; // 12 months of activity
}

export interface DesignPortfolio {
  projectCount: number;
  tools: string[];
  featuredProjects: { title: string; imageUrl: string; category: string }[];
  visualQualityScore: number; // 0-100
}

export interface PMProfile {
  caseStudies: { title: string; impact: string; metrics: string[] }[];
  productsShipped: number;
  impactMetrics: string[];
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  candidate: CandidateProfile;
  appliedAt: string;
  stage: ApplicationStage;
  fitScore: number;
  aiSummary: AIAssessment;
  notes: ApplicationNote[];
  rating: number; // 1-5, 0 = unrated
}

export interface AIAssessment {
  summary: string;
  strengths: string[];
  risks: string[];
  missingRequirements: string[];
  interviewFocusAreas: string[];
  technicalSummary?: string;
  designSummary?: string;
  productSummary?: string;
}

export interface ApplicationNote {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

// ---------- Comparison ----------

export interface ComparisonResult {
  candidates: string[];
  dimensions: ComparisonDimension[];
  aiInsight: string;
}

export interface ComparisonDimension {
  label: string;
  scores: Record<string, number>;
}
