# Folio Hire — AI-Powered Recruiter Platform

An intelligent hiring platform where recruiters can post jobs, review applicants with AI-generated fit scores, compare candidates side-by-side, and make faster, smarter hiring decisions.

> "Linear meets Notion meets AI-powered portfolio intelligence."

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — login with any credentials (demo mode).

## Architecture

### Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **State**: React Context + hooks

### Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login & Signup pages
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/      # Authenticated dashboard pages
│   │   ├── layout.tsx    # Sidebar + auth guard
│   │   ├── dashboard/    # Overview dashboard
│   │   ├── jobs/
│   │   │   ├── all/      # All jobs list
│   │   │   ├── new/      # Job creation form
│   │   │   └── [id]/     # Job detail + applicant list
│   │   ├── candidates/
│   │   │   └── [id]/     # Candidate detail page
│   │   └── compare/      # Side-by-side comparison
│   ├── api/
│   │   ├── jobs/         # Jobs CRUD API
│   │   ├── applications/ # Applications API
│   │   └── ai/score/     # AI scoring endpoint
│   ├── layout.tsx        # Root layout with AuthProvider
│   ├── page.tsx          # Entry redirect
│   └── globals.css       # Global styles
├── components/
│   ├── ui/               # Base components (Button, Badge, Avatar, etc.)
│   ├── layout/           # Sidebar, Header
│   ├── jobs/             # JobCard, JobCreationForm
│   ├── applicants/       # ApplicantTable, CandidateDetail
│   └── compare/          # ComparisonView
├── contexts/
│   ├── auth-context.tsx  # Authentication state
│   └── app-context.tsx   # Application data & actions
└── lib/
    ├── types.ts          # TypeScript type definitions
    ├── utils.ts          # Utility functions
    ├── ai-scoring.ts     # AI fit scoring engine
    └── mock-data.ts      # Realistic mock dataset
```

## Core Modules

### 1. Authentication & Roles
- Login/Signup with role selection (Recruiter, Hiring Manager, Admin)
- Company-scoped access
- Auth guard on dashboard routes

### 2. Job Creation
- Title, department, role type, experience level
- Required skills (tag input)
- Must-have & nice-to-have criteria
- **AI Enhance** — auto-generates description and suggests skills

### 3. Applicant Intake (AI Scoring)
When a candidate applies, the system automatically:
- Computes a **weighted fit score** (0–100)
- Generates strength bullets
- Identifies risk flags
- Lists missing requirements
- Suggests interview focus areas

**Scoring weights:**
| Dimension | Weight |
|-----------|--------|
| Skill match | 40% |
| Experience match | 25% |
| Must-have criteria | 20% |
| Portfolio strength | 15% |

### 4. Recruiter Dashboard
- Active jobs overview with applicant counts and avg fit scores
- Stage breakdown per job
- AI hiring insights
- Recent application feed

### 5. Applicant List View
- Sortable by: fit score, experience, recency, name
- Filterable by: stage, minimum fit score
- Inline star rating
- Checkbox selection for comparison
- Click to open candidate detail

### 6. Applicant Detail View (Adaptive)
**Fast Scan Panel**: Name, role, fit score, AI summary, quick actions

**Adaptive Content** — renders differently per role type:
- **Developer**: GitHub stats, top repos, contribution graph, AI technical summary
- **Designer**: Visual gallery, featured projects, design tools, AI design summary
- **PM**: Case studies, impact metrics, products shipped, AI product summary

**Actions**: Shortlist, Reject, Move stage, Add notes, Rate (1–5 stars)

### 7. AI Comparison Mode
- Select 2–3 candidates from the applicant table
- Side-by-side comparison on: fit score, experience, skills, strengths, risks
- AI generates natural-language comparison insight
- Skill match highlighting against job requirements

### 8. Decision Tracking
Pipeline stages: New → Reviewing → Shortlisted → Interview → Offer → Rejected

## Data Model

```typescript
User        → { id, name, email, role, companyId }
Company     → { id, name, domain }
Job         → { id, title, department, roleType, requiredSkills, ... }
Application → { id, jobId, candidateId, stage, fitScore, aiSummary, notes, rating }
Candidate   → { id, name, skills, github?, designPortfolio?, pmProfile? }
```

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | List all jobs |
| POST | `/api/jobs` | Create a new job |
| GET | `/api/applications?jobId=x` | List applications for a job |
| POST | `/api/ai/score` | Compute AI fit score for candidate+job |

## AI Scoring Logic (Pseudocode)

```
function computeFitScore(candidate, job):
  skillScore     = matchSkills(candidate.skills, job.requiredSkills)     × 0.40
  experienceScore = matchExperience(candidate.years, job.level)          × 0.25
  mustHaveScore  = matchCriteria(candidate.profile, job.mustHave)       × 0.20
  portfolioScore = evaluatePortfolio(candidate.github|design|pm)        × 0.15

  return clamp(0, 100, weighted_sum)
```

## Design Philosophy

- **Signal over noise** — AI surfaces what matters, hides what doesn't
- **Scan-ability** — recruiters can evaluate 20 candidates in <15 minutes
- **Adaptive intelligence** — UI and AI adapt to role type
- **Minimal cognitive load** — clean, focused, decision-oriented

## Next Steps (Phase 2)

- [ ] Persistent database (PostgreSQL + Prisma)
- [ ] Real authentication (NextAuth.js)
- [ ] LLM-powered AI summaries (OpenAI/Anthropic)
- [ ] Advanced analytics dashboard
- [ ] Multi-user permissions & teams
- [ ] Company branding customization
- [ ] Email notifications
- [ ] Candidate-facing application portal
