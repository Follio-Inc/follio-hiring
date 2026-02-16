import { Job, CandidateProfile, AIAssessment } from './types';

/**
 * AI Scoring Engine for Folio Hiring
 *
 * Computes a weighted fit score and generates intelligent assessments
 * by comparing candidate profiles against job requirements.
 *
 * Scoring weights:
 *   - Skill match:        40%
 *   - Experience match:    25%
 *   - Must-have criteria:  20%
 *   - Portfolio strength:  15%
 */

const EXPERIENCE_MAP: Record<string, number> = {
  junior: 1,
  mid: 3,
  senior: 5,
  lead: 8,
  principal: 10,
};

export function computeFitScore(candidate: CandidateProfile, job: Job): number {
  const skillScore = computeSkillMatch(candidate.skills, job.requiredSkills);
  const experienceScore = computeExperienceMatch(candidate.yearsOfExperience, job.experienceLevel);
  const mustHaveScore = computeMustHaveMatch(candidate, job.mustHave);
  const portfolioScore = computePortfolioStrength(candidate);

  const weighted =
    skillScore * 0.4 +
    experienceScore * 0.25 +
    mustHaveScore * 0.2 +
    portfolioScore * 0.15;

  return Math.round(Math.min(100, Math.max(0, weighted)));
}

function computeSkillMatch(candidateSkills: string[], requiredSkills: string[]): number {
  if (requiredSkills.length === 0) return 75;
  const normalizedCandidate = candidateSkills.map(s => s.toLowerCase());
  const matched = requiredSkills.filter(skill =>
    normalizedCandidate.some(cs =>
      cs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs)
    )
  );
  return (matched.length / requiredSkills.length) * 100;
}

function computeExperienceMatch(candidateYears: number, requiredLevel: string): number {
  const requiredYears = EXPERIENCE_MAP[requiredLevel] || 3;
  const diff = candidateYears - requiredYears;
  if (diff >= 0 && diff <= 3) return 100;
  if (diff > 3) return 85; // Overqualified slightly penalized
  if (diff >= -1) return 70;
  if (diff >= -2) return 40;
  return 20;
}

function computeMustHaveMatch(candidate: CandidateProfile, mustHave: string[]): number {
  if (mustHave.length === 0) return 80;
  const profileText = [
    candidate.bio,
    ...candidate.skills,
    candidate.title,
  ].join(' ').toLowerCase();

  const matched = mustHave.filter(criteria =>
    criteria.toLowerCase().split(' ').some(word =>
      word.length > 3 && profileText.includes(word.toLowerCase())
    )
  );
  return (matched.length / mustHave.length) * 100;
}

function computePortfolioStrength(candidate: CandidateProfile): number {
  let score = 50; // Base score

  if (candidate.github) {
    score += Math.min(20, candidate.github.repos * 1);
    score += Math.min(15, candidate.github.stars * 0.5);
    score += Math.min(15, candidate.github.contributions * 0.01);
  }

  if (candidate.designPortfolio) {
    score += Math.min(25, candidate.designPortfolio.projectCount * 5);
    score += (candidate.designPortfolio.visualQualityScore / 100) * 25;
  }

  if (candidate.pmProfile) {
    score += Math.min(25, candidate.pmProfile.caseStudies.length * 10);
    score += Math.min(25, candidate.pmProfile.productsShipped * 5);
  }

  return Math.min(100, score);
}

export function generateAIAssessment(
  candidate: CandidateProfile,
  job: Job,
  fitScore: number
): AIAssessment {
  const matchedSkills = job.requiredSkills.filter(skill =>
    candidate.skills.some(cs =>
      cs.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(cs.toLowerCase())
    )
  );

  const missingSkills = job.requiredSkills.filter(skill =>
    !candidate.skills.some(cs =>
      cs.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(cs.toLowerCase())
    )
  );

  const strengths = generateStrengths(candidate, matchedSkills, job);
  const risks = generateRisks(candidate, missingSkills, job);
  const missingRequirements = missingSkills.map(s => `Missing required skill: ${s}`);

  const interviewFocusAreas = [
    ...missingSkills.slice(0, 2).map(s => `Assess depth in ${s}`),
    ...(candidate.yearsOfExperience < EXPERIENCE_MAP[job.experienceLevel]
      ? ['Evaluate readiness for role level']
      : []),
    'Evaluate culture fit and communication style',
  ];

  const summary = generateSummary(candidate, job, fitScore, matchedSkills, missingSkills);

  const assessment: AIAssessment = {
    summary,
    strengths,
    risks,
    missingRequirements,
    interviewFocusAreas,
  };

  if (candidate.roleType === 'developer' && candidate.github) {
    assessment.technicalSummary = `Active developer with ${candidate.github.repos} repositories and ${candidate.github.stars} stars. Primary languages: ${candidate.github.topLanguages.slice(0, 3).join(', ')}. ${candidate.github.contributions > 500 ? 'High contribution activity suggests strong commitment.' : 'Moderate contribution activity.'}`;
  }

  if (candidate.roleType === 'designer' && candidate.designPortfolio) {
    assessment.designSummary = `Portfolio showcases ${candidate.designPortfolio.projectCount} projects using ${candidate.designPortfolio.tools.slice(0, 3).join(', ')}. Visual quality rated ${candidate.designPortfolio.visualQualityScore}/100.`;
  }

  if (candidate.roleType === 'pm' && candidate.pmProfile) {
    assessment.productSummary = `Shipped ${candidate.pmProfile.productsShipped} products with ${candidate.pmProfile.caseStudies.length} documented case studies. Key impact areas: ${candidate.pmProfile.impactMetrics.slice(0, 3).join(', ')}.`;
  }

  return assessment;
}

function generateSummary(
  candidate: CandidateProfile,
  job: Job,
  fitScore: number,
  matchedSkills: string[],
  missingSkills: string[]
): string {
  const matchPct = Math.round((matchedSkills.length / Math.max(job.requiredSkills.length, 1)) * 100);

  if (fitScore >= 85) {
    return `Strong match for ${job.title}. ${candidate.name} has ${candidate.yearsOfExperience} years of experience with ${matchPct}% skill alignment. Demonstrates depth in ${matchedSkills.slice(0, 3).join(', ')}. Recommended for fast-track review.`;
  }
  if (fitScore >= 70) {
    return `Good fit for ${job.title}. ${candidate.name} brings ${candidate.yearsOfExperience} years of experience and matches ${matchPct}% of required skills. ${missingSkills.length > 0 ? `Consider evaluating: ${missingSkills.slice(0, 2).join(', ')}.` : 'Well-rounded profile.'}`;
  }
  if (fitScore >= 50) {
    return `Moderate match for ${job.title}. ${candidate.name} aligns on ${matchPct}% of skills with ${candidate.yearsOfExperience} years experience. Gaps in ${missingSkills.slice(0, 2).join(', ')} may require evaluation.`;
  }
  return `Below-average match for ${job.title}. ${candidate.name} matches ${matchPct}% of required skills. Significant gaps in ${missingSkills.slice(0, 3).join(', ')}. Consider only if other qualities stand out.`;
}

function generateStrengths(
  candidate: CandidateProfile,
  matchedSkills: string[],
  job: Job
): string[] {
  const strengths: string[] = [];

  if (matchedSkills.length > 0) {
    strengths.push(`Strong skill match in ${matchedSkills.slice(0, 3).join(', ')}`);
  }

  if (candidate.yearsOfExperience >= EXPERIENCE_MAP[job.experienceLevel]) {
    strengths.push(`${candidate.yearsOfExperience} years of experience meets/exceeds requirements`);
  }

  if (candidate.github && candidate.github.stars > 50) {
    strengths.push(`Recognized open-source contributor (${candidate.github.stars} GitHub stars)`);
  }

  if (candidate.designPortfolio && candidate.designPortfolio.visualQualityScore > 80) {
    strengths.push(`High-quality visual portfolio (${candidate.designPortfolio.visualQualityScore}/100)`);
  }

  if (candidate.pmProfile && candidate.pmProfile.productsShipped > 3) {
    strengths.push(`Extensive product shipping experience (${candidate.pmProfile.productsShipped} products)`);
  }

  if (strengths.length === 0) {
    strengths.push('Diverse skill set with potential for growth');
  }

  return strengths;
}

function generateRisks(
  candidate: CandidateProfile,
  missingSkills: string[],
  job: Job
): string[] {
  const risks: string[] = [];

  if (missingSkills.length > 2) {
    risks.push(`Missing ${missingSkills.length} required skills: ${missingSkills.slice(0, 3).join(', ')}`);
  }

  if (candidate.yearsOfExperience < EXPERIENCE_MAP[job.experienceLevel] - 1) {
    risks.push(`Experience level (${candidate.yearsOfExperience}yr) below requirement`);
  }

  if (candidate.roleType === 'developer' && candidate.github && candidate.github.contributions < 100) {
    risks.push('Low GitHub activity — may indicate limited recent coding');
  }

  if (risks.length === 0) {
    risks.push('No significant risks identified');
  }

  return risks;
}

export function generateComparisonInsight(
  candidates: CandidateProfile[],
  job: Job,
  fitScores: number[]
): string {
  if (candidates.length < 2) return '';

  const sorted = candidates
    .map((c, i) => ({ candidate: c, score: fitScores[i] }))
    .sort((a, b) => b.score - a.score);

  const top = sorted[0];
  const second = sorted[1];

  const topStrengths = top.candidate.skills.filter(s =>
    job.requiredSkills.some(rs => rs.toLowerCase().includes(s.toLowerCase()))
  );
  const secondStrengths = second.candidate.skills.filter(s =>
    job.requiredSkills.some(rs => rs.toLowerCase().includes(s.toLowerCase()))
  );

  return `${top.candidate.name} (score: ${top.score}) leads with stronger alignment in ${topStrengths.slice(0, 2).join(' and ') || 'overall profile'}. ${second.candidate.name} (score: ${second.score}) shows potential in ${secondStrengths.slice(0, 2).join(' and ') || 'broader areas'}. ${top.score - second.score > 15 ? `Clear advantage for ${top.candidate.name}.` : 'Both candidates are competitive — consider interview performance as a tiebreaker.'}`;
}
