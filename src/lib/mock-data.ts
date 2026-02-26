import {
  User, Company, Job, CandidateProfile, Application,
  ApplicationStage, RoleType,
} from './types';
import { computeFitScore, generateAIAssessment } from './ai-scoring';

// ============================================================
// Company & User
// ============================================================

export const mockCompany: Company = {
  id: 'comp_1',
  name: 'Together',
  logo: undefined,
  domain: 'together.dev',
};

export const mockUser: User = {
  id: 'user_1',
  name: 'Sarah Chen',
  email: 'sarah@together.dev',
  role: 'recruiter',
  companyId: 'comp_1',
  avatarUrl: undefined,
};

// ============================================================
// Jobs
// ============================================================

export const mockJobs: Job[] = [
  {
    id: 'job_1',
    companyId: 'comp_1',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    roleType: 'developer',
    requiredSkills: ['React', 'TypeScript', 'Next.js', 'CSS', 'GraphQL', 'Testing'],
    experienceLevel: 'senior',
    description: 'We are looking for a Senior Frontend Engineer to lead the development of our next-generation portfolio platform. You will work closely with design and product to build beautiful, performant user interfaces.',
    mustHave: ['React expertise', 'TypeScript proficiency', 'Performance optimization experience', 'Component architecture'],
    niceToHave: ['GraphQL experience', 'Animation/motion design', 'Open source contributions'],
    createdAt: '2026-02-01T10:00:00Z',
    status: 'active',
    aiSnapshot: {
      idealCandidate: 'A senior frontend developer with 5+ years of React/TypeScript experience, strong design sense, and track record of building complex web applications. Ideally has experience with Next.js and modern CSS.',
      evaluationCriteria: ['React architecture depth', 'TypeScript mastery', 'UI/UX sensibility', 'Performance awareness', 'Collaboration skills'],
      keywords: ['react', 'typescript', 'next.js', 'frontend', 'component', 'css', 'performance'],
    },
    applicantCount: 12,
    avgFitScore: 72,
    stageBreakdown: { new: 4, reviewing: 3, shortlisted: 2, interview: 2, offer: 0, rejected: 1 },
  },
  {
    id: 'job_2',
    companyId: 'comp_1',
    title: 'Product Designer',
    department: 'Design',
    roleType: 'designer',
    requiredSkills: ['Figma', 'UI Design', 'User Research', 'Design Systems', 'Prototyping'],
    experienceLevel: 'mid',
    description: 'Join our design team to craft intuitive and delightful experiences for our portfolio platform. You will own end-to-end design for key product surfaces.',
    mustHave: ['Figma proficiency', 'Portfolio of shipped products', 'User research skills', 'Design system experience'],
    niceToHave: ['Motion design', 'Front-end development basics', 'Illustration skills'],
    createdAt: '2026-02-05T10:00:00Z',
    status: 'active',
    aiSnapshot: {
      idealCandidate: 'A product designer with 3+ years of experience, strong visual design skills, and a user-centered approach. Experience with design systems and developer collaboration preferred.',
      evaluationCriteria: ['Visual design quality', 'UX thinking', 'Design system experience', 'Research methodology', 'Collaboration'],
      keywords: ['figma', 'ui', 'ux', 'design system', 'prototyping', 'user research'],
    },
    applicantCount: 8,
    avgFitScore: 68,
    stageBreakdown: { new: 3, reviewing: 2, shortlisted: 1, interview: 1, offer: 0, rejected: 1 },
  },
  {
    id: 'job_3',
    companyId: 'comp_1',
    title: 'Senior Product Manager',
    department: 'Product',
    roleType: 'pm',
    requiredSkills: ['Product Strategy', 'Data Analysis', 'User Research', 'Roadmapping', 'A/B Testing'],
    experienceLevel: 'senior',
    description: 'Lead product strategy for our hiring platform. You will define the roadmap, work with engineering and design, and drive data-informed decisions to grow our recruiter-facing product.',
    mustHave: ['5+ years product management', 'B2B SaaS experience', 'Data-driven decision making', 'Technical product background'],
    niceToHave: ['HR tech experience', 'AI/ML product experience', 'Growth product experience'],
    createdAt: '2026-02-10T10:00:00Z',
    status: 'active',
    aiSnapshot: {
      idealCandidate: 'An experienced PM with B2B SaaS background, strong analytical skills, and ability to bridge technical and business domains. AI/ML product experience is a significant plus.',
      evaluationCriteria: ['Strategic thinking', 'Data analysis depth', 'Stakeholder management', 'Technical fluency', 'Execution track record'],
      keywords: ['product strategy', 'b2b', 'saas', 'data analysis', 'roadmap', 'growth'],
    },
    applicantCount: 6,
    avgFitScore: 65,
    stageBreakdown: { new: 2, reviewing: 2, shortlisted: 1, interview: 1, offer: 0, rejected: 0 },
  },
  {
    id: 'job_4',
    companyId: 'comp_1',
    title: 'Backend Engineer',
    department: 'Engineering',
    roleType: 'developer',
    requiredSkills: ['Node.js', 'PostgreSQL', 'REST APIs', 'Docker', 'TypeScript', 'Redis'],
    experienceLevel: 'mid',
    description: 'Build and scale the backend infrastructure powering Together. Work on APIs, data pipelines, and AI-integration services.',
    mustHave: ['Node.js or Python backend experience', 'SQL database expertise', 'API design skills', 'Cloud deployment experience'],
    niceToHave: ['AI/ML integration experience', 'Event-driven architecture', 'Kubernetes'],
    createdAt: '2026-02-12T10:00:00Z',
    status: 'active',
    aiSnapshot: {
      idealCandidate: 'A backend engineer with 3+ years experience building scalable APIs and services. Strong in Node.js/TypeScript with PostgreSQL expertise.',
      evaluationCriteria: ['System design', 'API architecture', 'Database optimization', 'Code quality', 'DevOps awareness'],
      keywords: ['node.js', 'postgresql', 'api', 'docker', 'backend', 'typescript'],
    },
    applicantCount: 9,
    avgFitScore: 70,
    stageBreakdown: { new: 3, reviewing: 2, shortlisted: 2, interview: 1, offer: 0, rejected: 1 },
  },
];

// ============================================================
// Candidates
// ============================================================

const candidates: CandidateProfile[] = [
  {
    id: 'cand_1',
    name: 'Alex Rivera',
    email: 'alex@email.com',
    avatarUrl: '',
    roleType: 'developer',
    title: 'Senior Frontend Developer',
    location: 'San Francisco, CA',
    yearsOfExperience: 7,
    skills: ['React', 'TypeScript', 'Next.js', 'GraphQL', 'TailwindCSS', 'Node.js', 'Testing'],
    bio: 'Passionate frontend engineer with 7 years of experience building performant React applications. Led frontend architecture at two startups. Open source contributor.',
    portfolioUrl: 'https://alexrivera.dev',
    github: {
      username: 'alexrivera',
      repos: 42,
      stars: 230,
      contributions: 1240,
      topLanguages: ['TypeScript', 'JavaScript', 'Python'],
      topProjects: [
        { name: 'react-motion-kit', description: 'Production-ready animation library for React', stars: 120, language: 'TypeScript' },
        { name: 'next-auth-starter', description: 'Next.js authentication boilerplate', stars: 67, language: 'TypeScript' },
        { name: 'graphql-codegen-plugin', description: 'Custom GraphQL code generator plugin', stars: 43, language: 'JavaScript' },
      ],
      activityData: [45, 62, 78, 55, 90, 102, 88, 74, 95, 110, 87, 65],
    },
  },
  {
    id: 'cand_2',
    name: 'Priya Sharma',
    email: 'priya@email.com',
    avatarUrl: '',
    roleType: 'developer',
    title: 'Full Stack Engineer',
    location: 'New York, NY',
    yearsOfExperience: 5,
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'CSS'],
    bio: 'Full stack engineer specializing in React and Node.js. Built and scaled applications serving millions of users. Strong in performance optimization and accessibility.',
    portfolioUrl: 'https://priyasharma.io',
    github: {
      username: 'priyasharma',
      repos: 28,
      stars: 85,
      contributions: 780,
      topLanguages: ['TypeScript', 'JavaScript', 'Go'],
      topProjects: [
        { name: 'accessible-ui', description: 'Accessible component library', stars: 45, language: 'TypeScript' },
        { name: 'perf-monitor', description: 'Real-time performance monitoring dashboard', stars: 28, language: 'JavaScript' },
        { name: 'api-gateway', description: 'Lightweight API gateway in Go', stars: 12, language: 'Go' },
      ],
      activityData: [30, 45, 52, 48, 65, 70, 55, 40, 60, 75, 68, 50],
    },
  },
  {
    id: 'cand_3',
    name: 'Marcus Johnson',
    email: 'marcus@email.com',
    avatarUrl: '',
    roleType: 'developer',
    title: 'Frontend Developer',
    location: 'Austin, TX',
    yearsOfExperience: 3,
    skills: ['React', 'JavaScript', 'CSS', 'HTML', 'Redux', 'Jest'],
    bio: 'Frontend developer with 3 years of experience. Focused on building clean, maintainable interfaces. Growing into TypeScript and Next.js.',
    portfolioUrl: 'https://marcusjohnson.dev',
    github: {
      username: 'marcusj',
      repos: 15,
      stars: 12,
      contributions: 320,
      topLanguages: ['JavaScript', 'CSS', 'HTML'],
      topProjects: [
        { name: 'weather-app', description: 'Beautiful weather dashboard', stars: 8, language: 'JavaScript' },
        { name: 'todo-redux', description: 'Feature-rich todo app with Redux', stars: 4, language: 'JavaScript' },
      ],
      activityData: [15, 20, 25, 18, 30, 35, 28, 22, 32, 40, 35, 28],
    },
  },
  {
    id: 'cand_4',
    name: 'Emma Wilson',
    email: 'emma@email.com',
    avatarUrl: '',
    roleType: 'designer',
    title: 'Senior Product Designer',
    location: 'London, UK',
    yearsOfExperience: 6,
    skills: ['Figma', 'UI Design', 'User Research', 'Design Systems', 'Prototyping', 'Illustration'],
    bio: 'Product designer passionate about creating intuitive digital experiences. Led design systems at two startups. Strong in user research and data-informed design.',
    portfolioUrl: 'https://emmawilson.design',
    designPortfolio: {
      projectCount: 24,
      tools: ['Figma', 'Framer', 'Principle', 'Illustrator'],
      featuredProjects: [
        { title: 'FinTech App Redesign', imageUrl: '/projects/fintech.jpg', category: 'Mobile App' },
        { title: 'SaaS Dashboard System', imageUrl: '/projects/saas.jpg', category: 'Web App' },
        { title: 'Brand Identity — Nexus', imageUrl: '/projects/brand.jpg', category: 'Branding' },
      ],
      visualQualityScore: 92,
    },
  },
  {
    id: 'cand_5',
    name: 'David Kim',
    email: 'david@email.com',
    avatarUrl: '',
    roleType: 'designer',
    title: 'UI/UX Designer',
    location: 'Seattle, WA',
    yearsOfExperience: 4,
    skills: ['Figma', 'UI Design', 'Prototyping', 'CSS', 'User Testing'],
    bio: 'UI/UX designer with a knack for clean, functional interfaces. Bridging design and development with strong CSS skills.',
    portfolioUrl: 'https://davidkim.co',
    designPortfolio: {
      projectCount: 16,
      tools: ['Figma', 'Sketch', 'Adobe XD'],
      featuredProjects: [
        { title: 'E-commerce Checkout Flow', imageUrl: '/projects/ecom.jpg', category: 'Web App' },
        { title: 'Health Tracking Dashboard', imageUrl: '/projects/health.jpg', category: 'Mobile App' },
      ],
      visualQualityScore: 78,
    },
  },
  {
    id: 'cand_6',
    name: 'Sofia Martinez',
    email: 'sofia@email.com',
    avatarUrl: '',
    roleType: 'pm',
    title: 'Senior Product Manager',
    location: 'Chicago, IL',
    yearsOfExperience: 8,
    skills: ['Product Strategy', 'Data Analysis', 'User Research', 'SQL', 'A/B Testing', 'Roadmapping'],
    bio: 'Product leader with 8 years of B2B SaaS experience. Shipped products used by Fortune 500 companies. Driven by data and user empathy.',
    portfolioUrl: 'https://sofiamartinez.pm',
    pmProfile: {
      caseStudies: [
        { title: 'Enterprise Dashboard Redesign', impact: 'Increased user engagement by 40%', metrics: ['40% engagement increase', '25% reduction in support tickets', '15% revenue uplift'] },
        { title: 'AI-Powered Search Launch', impact: 'Reduced time-to-find by 60%', metrics: ['60% faster search', '90% user satisfaction', '3x search volume'] },
        { title: 'Onboarding Flow Optimization', impact: 'Improved activation rate by 35%', metrics: ['35% activation increase', '20% churn reduction'] },
      ],
      productsShipped: 7,
      impactMetrics: ['$12M ARR growth', '40% engagement increase', '60% faster workflows'],
    },
  },
  {
    id: 'cand_7',
    name: 'James Chen',
    email: 'james@email.com',
    avatarUrl: '',
    roleType: 'pm',
    title: 'Product Manager',
    location: 'Remote',
    yearsOfExperience: 4,
    skills: ['Product Strategy', 'User Research', 'Roadmapping', 'Jira', 'Analytics'],
    bio: 'Product manager focused on growth and user experience. Previously at a mid-stage startup, now looking for a product-led company.',
    portfolioUrl: 'https://jameschen.pm',
    pmProfile: {
      caseStudies: [
        { title: 'Growth Experiment Framework', impact: 'Systematized testing across 3 teams', metrics: ['50+ experiments run', '12% conversion uplift'] },
      ],
      productsShipped: 3,
      impactMetrics: ['12% conversion uplift', '3x experiment velocity'],
    },
  },
  {
    id: 'cand_8',
    name: 'Lena Park',
    email: 'lena@email.com',
    avatarUrl: '',
    roleType: 'developer',
    title: 'Frontend Engineer',
    location: 'Berlin, Germany',
    yearsOfExperience: 4,
    skills: ['React', 'TypeScript', 'Next.js', 'CSS', 'Storybook', 'Vitest'],
    bio: 'Frontend engineer with a keen eye for detail and animation. Building delightful interfaces with React and TypeScript.',
    portfolioUrl: 'https://lenapark.dev',
    github: {
      username: 'lenapark',
      repos: 22,
      stars: 65,
      contributions: 560,
      topLanguages: ['TypeScript', 'JavaScript', 'CSS'],
      topProjects: [
        { name: 'motion-primitives', description: 'Animation primitives for React', stars: 35, language: 'TypeScript' },
        { name: 'design-tokens-cli', description: 'CLI for managing design tokens', stars: 20, language: 'TypeScript' },
      ],
      activityData: [35, 42, 50, 38, 55, 62, 48, 40, 58, 70, 55, 45],
    },
  },
  {
    id: 'cand_9',
    name: 'Ryan O\'Brien',
    email: 'ryan@email.com',
    avatarUrl: '',
    roleType: 'developer',
    title: 'Backend Engineer',
    location: 'Dublin, Ireland',
    yearsOfExperience: 5,
    skills: ['Node.js', 'TypeScript', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'REST APIs'],
    bio: 'Backend engineer with expertise in building scalable APIs and microservices. Experience with high-throughput systems and event-driven architecture.',
    portfolioUrl: 'https://ryanobrien.dev',
    github: {
      username: 'ryanobrien',
      repos: 18,
      stars: 42,
      contributions: 680,
      topLanguages: ['TypeScript', 'Go', 'Python'],
      topProjects: [
        { name: 'event-bus', description: 'Lightweight event bus for Node.js microservices', stars: 22, language: 'TypeScript' },
        { name: 'pg-migrate', description: 'PostgreSQL migration tool', stars: 15, language: 'TypeScript' },
      ],
      activityData: [40, 35, 50, 45, 60, 55, 48, 52, 65, 58, 50, 42],
    },
  },
  {
    id: 'cand_10',
    name: 'Aisha Patel',
    email: 'aisha@email.com',
    avatarUrl: '',
    roleType: 'designer',
    title: 'Product Designer',
    location: 'Toronto, Canada',
    yearsOfExperience: 3,
    skills: ['Figma', 'UI Design', 'Prototyping', 'User Research', 'Design Systems'],
    bio: 'Product designer who loves turning complex problems into simple, elegant solutions. Focused on accessible and inclusive design.',
    portfolioUrl: 'https://aishapatel.design',
    designPortfolio: {
      projectCount: 12,
      tools: ['Figma', 'Framer'],
      featuredProjects: [
        { title: 'Accessibility Toolkit', imageUrl: '/projects/a11y.jpg', category: 'Design System' },
        { title: 'Travel Booking App', imageUrl: '/projects/travel.jpg', category: 'Mobile App' },
      ],
      visualQualityScore: 82,
    },
  },
];

// ============================================================
// Applications — auto-generated with AI scoring
// ============================================================

function createApplication(
  candidateId: string,
  jobId: string,
  stage: ApplicationStage,
  appliedDaysAgo: number,
  rating: number = 0,
): Application {
  const candidate = candidates.find(c => c.id === candidateId)!;
  const job = mockJobs.find(j => j.id === jobId)!;
  const fitScore = computeFitScore(candidate, job);
  const aiSummary = generateAIAssessment(candidate, job, fitScore);

  return {
    id: `app_${candidateId}_${jobId}`,
    jobId,
    candidateId,
    candidate,
    appliedAt: new Date(Date.now() - appliedDaysAgo * 86400000).toISOString(),
    stage,
    fitScore,
    aiSummary,
    notes: rating > 0
      ? [{ id: 'note_1', authorId: 'user_1', authorName: 'Sarah Chen', content: 'Interesting profile, worth a closer look.', createdAt: new Date(Date.now() - (appliedDaysAgo - 1) * 86400000).toISOString() }]
      : [],
    rating,
  };
}

export const mockApplications: Application[] = [
  // Job 1: Senior Frontend Engineer
  createApplication('cand_1', 'job_1', 'interview', 12, 4),
  createApplication('cand_2', 'job_1', 'shortlisted', 10, 3),
  createApplication('cand_3', 'job_1', 'reviewing', 8, 0),
  createApplication('cand_8', 'job_1', 'shortlisted', 7, 4),
  // Job 2: Product Designer
  createApplication('cand_4', 'job_2', 'interview', 9, 5),
  createApplication('cand_5', 'job_2', 'reviewing', 6, 0),
  createApplication('cand_10', 'job_2', 'new', 3, 0),
  // Job 3: Senior Product Manager
  createApplication('cand_6', 'job_3', 'shortlisted', 5, 4),
  createApplication('cand_7', 'job_3', 'new', 2, 0),
  // Job 4: Backend Engineer
  createApplication('cand_9', 'job_4', 'reviewing', 4, 0),
  createApplication('cand_2', 'job_4', 'new', 1, 0),
];

export function getJobApplications(jobId: string): Application[] {
  return mockApplications.filter(a => a.jobId === jobId);
}

export function getApplication(applicationId: string): Application | undefined {
  return mockApplications.find(a => a.id === applicationId);
}

export function getCandidateById(candidateId: string): CandidateProfile | undefined {
  return candidates.find(c => c.id === candidateId);
}

export function getApplicationsForCandidate(candidateId: string, jobId: string): Application | undefined {
  return mockApplications.find(a => a.candidateId === candidateId && a.jobId === jobId);
}

// ============================================================
// Additional Candidates — for richer per-job analytics
// ============================================================

function quickCandidate(
  id: string, name: string, role: RoleType, title: string,
  loc: string, years: number, skills: string[],
): CandidateProfile {
  return {
    id, name,
    email: `${name.split(' ')[0].toLowerCase()}${id.slice(-2)}@email.com`,
    avatarUrl: '', roleType: role, title, location: loc,
    yearsOfExperience: years, skills,
    bio: `${title} with ${years} years of experience specializing in ${skills.slice(0, 3).join(', ')}.`,
  };
}

candidates.push(
  // ---- Developers (cand_11 – cand_28, cand_44 – cand_51) ----
  quickCandidate('cand_11', 'Tom Anderson', 'developer', 'Frontend Developer', 'Portland, OR', 4, ['React', 'TypeScript', 'CSS', 'Vue.js', 'Jest']),
  quickCandidate('cand_12', 'Nina Kowalski', 'developer', 'Senior Software Engineer', 'Denver, CO', 6, ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS']),
  quickCandidate('cand_13', 'Carlos Vega', 'developer', 'Junior Frontend Developer', 'Miami, FL', 2, ['React', 'JavaScript', 'CSS', 'HTML']),
  quickCandidate('cand_14', 'Yuki Tanaka', 'developer', 'Full Stack Engineer', 'Tokyo, Japan', 7, ['React', 'TypeScript', 'Python', 'Docker', 'PostgreSQL']),
  quickCandidate('cand_15', 'Rachel Green', 'developer', 'Frontend Developer', 'Boston, MA', 3, ['React', 'TypeScript', 'CSS', 'Testing', 'Storybook']),
  quickCandidate('cand_16', 'Omar Hassan', 'developer', 'Software Engineer', 'Amsterdam, NL', 5, ['React', 'TypeScript', 'Next.js', 'AWS', 'GraphQL']),
  quickCandidate('cand_17', 'Zoe Williams', 'developer', 'Frontend Developer', 'Los Angeles, CA', 4, ['React', 'JavaScript', 'CSS', 'Redux', 'Storybook']),
  quickCandidate('cand_18', 'Max Fischer', 'developer', 'Backend Developer', 'Munich, DE', 6, ['Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'Redis']),
  quickCandidate('cand_19', 'Anya Petrov', 'developer', 'Full Stack Developer', 'Prague, CZ', 3, ['React', 'Node.js', 'MongoDB', 'Docker', 'JavaScript']),
  quickCandidate('cand_20', 'Ben Taylor', 'developer', 'Backend Engineer', 'Sydney, AU', 4, ['Node.js', 'Python', 'PostgreSQL', 'AWS', 'Docker']),
  quickCandidate('cand_21', 'Luna Chen', 'developer', 'Senior Backend Engineer', 'Vancouver, CA', 5, ['Node.js', 'TypeScript', 'PostgreSQL', 'Redis', 'Kubernetes']),
  quickCandidate('cand_22', 'Jake Morrison', 'developer', 'Backend Developer', 'Atlanta, GA', 3, ['Node.js', 'Express', 'MySQL', 'Docker', 'REST APIs']),
  quickCandidate('cand_23', 'Hannah Lee', 'developer', 'Frontend Developer', 'Seoul, KR', 5, ['React', 'TypeScript', 'Next.js', 'CSS', 'GraphQL']),
  quickCandidate('cand_24', 'Sam Carter', 'developer', 'Software Engineer', 'Chicago, IL', 4, ['React', 'TypeScript', 'Node.js', 'Docker', 'Testing']),
  quickCandidate('cand_25', 'Mila Novak', 'developer', 'Full Stack Developer', 'Zagreb, HR', 3, ['React', 'JavaScript', 'Node.js', 'PostgreSQL', 'CSS']),
  quickCandidate('cand_26', 'Daniel Park', 'developer', 'Frontend Engineer', 'Los Angeles, CA', 6, ['React', 'TypeScript', 'Next.js', 'GraphQL', 'Testing']),
  quickCandidate('cand_27', 'Isabella Rossi', 'developer', 'Backend Engineer', 'Rome, IT', 4, ['Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'Redis']),
  quickCandidate('cand_28', 'Andre Williams', 'developer', 'Full Stack Engineer', 'Houston, TX', 5, ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS']),
  quickCandidate('cand_44', 'Josh Reeves', 'developer', 'React Developer', 'Phoenix, AZ', 3, ['React', 'JavaScript', 'CSS', 'HTML', 'Redux']),
  quickCandidate('cand_45', 'Fatima Al-Rashidi', 'developer', 'Senior Frontend Dev', 'Dubai, UAE', 7, ['React', 'TypeScript', 'Next.js', 'GraphQL', 'Testing']),
  quickCandidate('cand_46', 'Patrick O\'Neal', 'developer', 'Frontend Developer', 'Dublin, IE', 4, ['React', 'TypeScript', 'CSS', 'Storybook', 'Jest']),
  quickCandidate('cand_47', 'Kim Soo-yeon', 'developer', 'Software Engineer', 'Seoul, KR', 5, ['React', 'TypeScript', 'Next.js', 'Node.js', 'AWS']),
  quickCandidate('cand_48', 'Viktor Popov', 'developer', 'Backend Engineer', 'Moscow, RU', 4, ['Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'Redis']),
  quickCandidate('cand_49', 'Amara Diallo', 'developer', 'Full Stack Dev', 'Dakar, SN', 3, ['React', 'Node.js', 'JavaScript', 'MongoDB', 'CSS']),
  quickCandidate('cand_50', 'Lucas Schmidt', 'developer', 'Backend Developer', 'Berlin, DE', 6, ['Node.js', 'TypeScript', 'PostgreSQL', 'Kubernetes', 'Redis']),
  quickCandidate('cand_51', 'Elena Volkov', 'developer', 'Frontend Engineer', 'Kyiv, UA', 5, ['React', 'TypeScript', 'CSS', 'Next.js', 'Testing']),

  // ---- Designers (cand_29 – cand_36, cand_52 – cand_55) ----
  quickCandidate('cand_29', 'Mia Torres', 'designer', 'Product Designer', 'Barcelona, ES', 5, ['Figma', 'UI Design', 'User Research', 'Design Systems', 'Prototyping']),
  quickCandidate('cand_30', 'Felix Müller', 'designer', 'UX Designer', 'Hamburg, DE', 3, ['Figma', 'User Research', 'Prototyping', 'Wireframing']),
  quickCandidate('cand_31', 'Iris Chang', 'designer', 'Visual Designer', 'Singapore', 4, ['Figma', 'UI Design', 'Illustration', 'Branding']),
  quickCandidate('cand_32', 'Noah Baker', 'designer', 'Senior Product Designer', 'Denver, CO', 6, ['Figma', 'Design Systems', 'Prototyping', 'User Research', 'UI Design']),
  quickCandidate('cand_33', 'Ava Thompson', 'designer', 'UI Designer', 'Melbourne, AU', 2, ['Figma', 'UI Design', 'CSS', 'Prototyping']),
  quickCandidate('cand_34', 'Leo Rossi', 'designer', 'UX/UI Designer', 'Milan, IT', 5, ['Figma', 'UI Design', 'User Research', 'Motion Design']),
  quickCandidate('cand_35', 'Chloe Dubois', 'designer', 'Product Designer', 'Paris, FR', 4, ['Figma', 'UI Design', 'Design Systems', 'Prototyping']),
  quickCandidate('cand_36', 'Wei Zhang', 'designer', 'Visual Designer', 'Shanghai, CN', 3, ['Figma', 'UI Design', 'Illustration', 'Branding', 'Prototyping']),
  quickCandidate('cand_52', 'Ravi Patel', 'designer', 'Product Designer', 'Mumbai, IN', 5, ['Figma', 'UI Design', 'Design Systems', 'User Research', 'Prototyping']),
  quickCandidate('cand_53', 'Clara Johansen', 'designer', 'UX Designer', 'Copenhagen, DK', 4, ['Figma', 'User Research', 'Prototyping', 'UI Design']),
  quickCandidate('cand_54', 'Takeshi Yamamoto', 'designer', 'Visual Designer', 'Osaka, JP', 3, ['Figma', 'UI Design', 'Illustration', 'Prototyping']),
  quickCandidate('cand_55', 'Olivia Brown', 'designer', 'Senior Product Designer', 'London, UK', 7, ['Figma', 'Design Systems', 'User Research', 'UI Design', 'Prototyping']),

  // ---- PMs (cand_37 – cand_43, cand_56 – cand_58) ----
  quickCandidate('cand_37', 'Diana Foster', 'pm', 'Product Manager', 'Washington, DC', 6, ['Product Strategy', 'Data Analysis', 'SQL', 'User Research', 'A/B Testing']),
  quickCandidate('cand_38', 'Kevin Wu', 'pm', 'Senior Product Manager', 'San Francisco, CA', 9, ['Product Strategy', 'Roadmapping', 'A/B Testing', 'Data Analysis', 'SQL']),
  quickCandidate('cand_39', 'Nadia Ali', 'pm', 'Product Manager', 'New York, NY', 4, ['User Research', 'Analytics', 'Roadmapping', 'Product Strategy']),
  quickCandidate('cand_40', 'Chris Evans', 'pm', 'Associate PM', 'Remote', 3, ['Product Strategy', 'Jira', 'Analytics', 'Roadmapping']),
  quickCandidate('cand_41', 'Maya Gupta', 'pm', 'Senior Product Manager', 'Bangalore, IN', 7, ['Product Strategy', 'Data Analysis', 'A/B Testing', 'SQL', 'Roadmapping']),
  quickCandidate('cand_42', 'Thomas Bergström', 'pm', 'Product Manager', 'Stockholm, SE', 5, ['Product Strategy', 'User Research', 'SQL', 'Data Analysis']),
  quickCandidate('cand_43', 'Sarah Okonkwo', 'pm', 'Product Manager', 'Lagos, NG', 4, ['Product Strategy', 'Analytics', 'Roadmapping', 'User Research']),
  quickCandidate('cand_56', 'Raj Kapoor', 'pm', 'Product Manager', 'Delhi, IN', 5, ['Product Strategy', 'Data Analysis', 'User Research', 'Roadmapping', 'A/B Testing']),
  quickCandidate('cand_57', 'Emma Larsson', 'pm', 'Senior PM', 'Gothenburg, SE', 8, ['Product Strategy', 'SQL', 'Data Analysis', 'Roadmapping', 'A/B Testing']),
  quickCandidate('cand_58', 'Marco Bianchi', 'pm', 'Associate PM', 'Florence, IT', 2, ['Product Strategy', 'Analytics', 'Jira', 'User Research']),
);

// ============================================================
// Additional Applications — for meaningful per-job funnels
// ============================================================
// Job 1 target: 30 (new:8 reviewing:6 shortlisted:5 interview:4 offer:2 rejected:5)
// Job 2 target: 15 (new:4 reviewing:4 shortlisted:2 interview:2 offer:1 rejected:2)
// Job 3 target: 14 (new:4 reviewing:3 shortlisted:3 interview:2 offer:1 rejected:1)
// Job 4 target: 24 (new:7 reviewing:6 shortlisted:4 interview:3 offer:1 rejected:3)

mockApplications.push(
  // ---- Job 1: Senior Frontend Engineer (26 new → 30 total) ----
  createApplication('cand_11', 'job_1', 'new', 3),
  createApplication('cand_13', 'job_1', 'new', 2),
  createApplication('cand_17', 'job_1', 'new', 1),
  createApplication('cand_19', 'job_1', 'new', 4),
  createApplication('cand_25', 'job_1', 'new', 3),
  createApplication('cand_27', 'job_1', 'new', 1),
  createApplication('cand_44', 'job_1', 'new', 2),
  createApplication('cand_49', 'job_1', 'new', 4),
  createApplication('cand_12', 'job_1', 'reviewing', 8, 3),
  createApplication('cand_15', 'job_1', 'reviewing', 9),
  createApplication('cand_23', 'job_1', 'reviewing', 7),
  createApplication('cand_28', 'job_1', 'reviewing', 6),
  createApplication('cand_46', 'job_1', 'reviewing', 5),
  createApplication('cand_16', 'job_1', 'shortlisted', 11, 3),
  createApplication('cand_24', 'job_1', 'shortlisted', 10, 3),
  createApplication('cand_45', 'job_1', 'shortlisted', 12, 4),
  createApplication('cand_14', 'job_1', 'interview', 13, 4),
  createApplication('cand_26', 'job_1', 'interview', 12, 4),
  createApplication('cand_51', 'job_1', 'interview', 11, 3),
  createApplication('cand_47', 'job_1', 'offer', 14, 5),
  createApplication('cand_21', 'job_1', 'offer', 14, 5),
  createApplication('cand_18', 'job_1', 'rejected', 10),
  createApplication('cand_20', 'job_1', 'rejected', 9),
  createApplication('cand_22', 'job_1', 'rejected', 7),
  createApplication('cand_48', 'job_1', 'rejected', 8),
  createApplication('cand_50', 'job_1', 'rejected', 6),

  // ---- Job 2: Product Designer (12 new → 15 total) ----
  createApplication('cand_33', 'job_2', 'new', 2),
  createApplication('cand_36', 'job_2', 'new', 1),
  createApplication('cand_54', 'job_2', 'new', 3),
  createApplication('cand_30', 'job_2', 'reviewing', 6),
  createApplication('cand_35', 'job_2', 'reviewing', 7),
  createApplication('cand_53', 'job_2', 'reviewing', 5),
  createApplication('cand_29', 'job_2', 'shortlisted', 9, 3),
  createApplication('cand_52', 'job_2', 'shortlisted', 8, 3),
  createApplication('cand_31', 'job_2', 'interview', 10, 4),
  createApplication('cand_55', 'job_2', 'offer', 13, 5),
  createApplication('cand_34', 'job_2', 'rejected', 8),
  createApplication('cand_32', 'job_2', 'rejected', 7),

  // ---- Job 3: Senior Product Manager (12 new → 14 total) ----
  createApplication('cand_39', 'job_3', 'new', 3),
  createApplication('cand_40', 'job_3', 'new', 2),
  createApplication('cand_58', 'job_3', 'new', 1),
  createApplication('cand_43', 'job_3', 'reviewing', 6),
  createApplication('cand_56', 'job_3', 'reviewing', 5),
  createApplication('cand_37', 'job_3', 'shortlisted', 9, 3),
  createApplication('cand_42', 'job_3', 'shortlisted', 8, 3),
  createApplication('cand_38', 'job_3', 'interview', 11, 4),
  createApplication('cand_57', 'job_3', 'interview', 10, 4),
  createApplication('cand_41', 'job_3', 'offer', 13, 5),
  createApplication('cand_11', 'job_3', 'reviewing', 7),
  createApplication('cand_13', 'job_3', 'rejected', 6),

  // ---- Job 4: Backend Engineer (22 new → 24 total) ----
  createApplication('cand_11', 'job_4', 'new', 3),
  createApplication('cand_17', 'job_4', 'new', 2),
  createApplication('cand_25', 'job_4', 'new', 4),
  createApplication('cand_44', 'job_4', 'new', 1),
  createApplication('cand_49', 'job_4', 'new', 3),
  createApplication('cand_13', 'job_4', 'new', 2),
  createApplication('cand_12', 'job_4', 'reviewing', 7),
  createApplication('cand_15', 'job_4', 'reviewing', 8),
  createApplication('cand_19', 'job_4', 'reviewing', 6),
  createApplication('cand_23', 'job_4', 'reviewing', 5),
  createApplication('cand_46', 'job_4', 'reviewing', 7),
  createApplication('cand_14', 'job_4', 'shortlisted', 10, 3),
  createApplication('cand_24', 'job_4', 'shortlisted', 9, 3),
  createApplication('cand_28', 'job_4', 'shortlisted', 11, 3),
  createApplication('cand_45', 'job_4', 'shortlisted', 10, 4),
  createApplication('cand_18', 'job_4', 'interview', 12, 4),
  createApplication('cand_50', 'job_4', 'interview', 11, 4),
  createApplication('cand_21', 'job_4', 'interview', 13, 4),
  createApplication('cand_27', 'job_4', 'offer', 14, 5),
  createApplication('cand_16', 'job_4', 'rejected', 8),
  createApplication('cand_22', 'job_4', 'rejected', 6),
  createApplication('cand_47', 'job_4', 'rejected', 7),
);

// ============================================================
// Sync job metadata from actual application records
// ============================================================

for (const job of mockJobs) {
  const jobApps = mockApplications.filter(a => a.jobId === job.id);
  job.applicantCount = jobApps.length;
  job.avgFitScore = Math.round(
    jobApps.reduce((sum, a) => sum + a.fitScore, 0) / Math.max(jobApps.length, 1),
  );
  const bd: Record<ApplicationStage, number> = {
    new: 0, reviewing: 0, shortlisted: 0, interview: 0, offer: 0, rejected: 0,
  };
  for (const app of jobApps) bd[app.stage]++;
  job.stageBreakdown = bd;
}

export { candidates as mockCandidates };
