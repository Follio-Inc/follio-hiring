# Todo

## Bug: Hiring signup company creation does nothing after entering company name

- [x] Reproduce the issue locally and identify the failing step (UI submit, API call, DB write, or redirect)
- [x] Locate root cause in hiring onboarding/company creation flow
- [x] Implement fix with minimal, robust changes
- [x] Verify behavior with targeted checks (lint/build/runtime logs and flow validation)
- [x] Add review notes with what changed and evidence of correctness

## Review

- Root cause 1: `CompanyOnboarding` submit path in `src/app/(hiring)/layout.tsx` did not check Supabase errors, so failed inserts looked like "nothing happens".
- Root cause 2: `company_members` insert RLS policy in `supabase-schema.sql` used an unaliased self-reference (`company_members.company_id`) in a subquery, which can evaluate against the inner scope and block first-member creation when rows already exist for other companies.
- Fix 1: Added explicit error handling and user-facing error rendering in onboarding company creation.
- Fix 2: Updated policy query to alias subquery table (`cm`) and compare against the outer row's `company_id`.
- Added hotfix SQL file: `supabase-hotfix-company-members-policy.sql` for applying the policy update to existing Supabase environments.
- Verification:
  - `node ./node_modules/next/dist/bin/next build` passed.
  - `node ./node_modules/eslint/bin/eslint.js .` failed with pre-existing lint errors in unrelated files:
    - `src/app/(candidate)/profile/page.tsx`
    - `src/app/page.tsx`
    - `src/components/applicants/applicant-table.tsx`
    - `src/contexts/app-context.tsx`
