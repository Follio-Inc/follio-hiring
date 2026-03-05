# Todo

## Bug: Hiring signup company creation does nothing after entering company name

- [x] Reproduce the issue locally and identify the failing step (UI submit, API call, DB write, or redirect)
- [x] Locate root cause in hiring onboarding/company creation flow
- [x] Implement fix with minimal, robust changes
- [x] Verify behavior with targeted checks (lint/build/runtime logs and flow validation)
- [x] Add review notes with what changed and evidence of correctness

## Review

- Root cause 1: `CompanyOnboarding` submit path in `src/app/(hiring)/layout.tsx` did not check Supabase errors, so failed inserts looked like "nothing happens".
- Root cause 2: `company_members` RLS used self-referential policy queries (`company_members` querying itself), which triggered `infinite recursion detected in policy for relation "company_members"`.
- Fix 1: Added explicit error handling and user-facing error rendering in onboarding company creation.
- Fix 2: Replaced recursive membership checks with `SECURITY DEFINER` helper functions (`is_company_member`, `is_company_admin`, `is_first_company_member`, `get_my_profile_email`, `has_pending_invite_for_company`) and rebuilt dependent policies to use them.
- Fix 3: Added invite acceptance policy for invited users (`accepted_at` updates by matching email) and added explicit error handling in invite flow for membership insert + invitation update.
- Added hotfix SQL file: `supabase-hotfix-company-members-policy.sql` containing full function + policy migration for existing Supabase environments.
- Verification:
  - `node ./node_modules/next/dist/bin/next build` passed.
  - `node ./node_modules/eslint/bin/eslint.js src/app/invite/[token]/page.tsx` passed.
  - `node ./node_modules/eslint/bin/eslint.js .` failed with pre-existing lint errors in unrelated files:
    - `src/app/(candidate)/profile/page.tsx`
    - `src/app/page.tsx`
    - `src/components/applicants/applicant-table.tsx`
    - `src/contexts/app-context.tsx`

## Feature: Company-scoped candidate portal

- [x] Add candidate company selection during signup
- [x] Add backend endpoint to list companies for signup
- [x] Enforce company-scoped candidate job access in APIs
- [x] Enforce company-scoped candidate access in DB policies
- [x] Verify build and targeted lint checks

## Review (Candidate Scope)

- Added candidate signup company selection and passed `company_id` in signup metadata.
- Added `GET /api/companies` backed by a security-definer DB function to return company options.
- Candidate jobs APIs now require authenticated candidate users and filter by their selected `company_id`.
- Updated middleware so `/jobs` routes are authenticated-only and recruiters are redirected away from candidate-only routes.
- Updated schema + hotfix SQL with `candidate_profiles.company_id`, helper functions, trigger updates, and RLS policy updates for jobs/applications/companies.
- Verification:
  - `node ./node_modules/next/dist/bin/next build` passed.
  - `node ./node_modules/eslint/bin/eslint.js` on touched files passed.
  - Full repo lint still fails on existing unrelated files (`src/app/(candidate)/profile/page.tsx`, `src/app/page.tsx`, `src/components/applicants/applicant-table.tsx`, `src/contexts/app-context.tsx`).
