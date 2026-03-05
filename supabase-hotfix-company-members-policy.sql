-- Full RLS hardening for company onboarding and invite acceptance.
-- Apply in Supabase SQL Editor to update existing projects.

BEGIN;

-- Helper functions for RLS checks
CREATE OR REPLACE FUNCTION public.is_company_member(target_company_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.company_members cm
    WHERE cm.company_id = target_company_id
      AND cm.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_company_admin(target_company_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.company_members cm
    WHERE cm.company_id = target_company_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_first_company_member(target_company_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.company_members cm
    WHERE cm.company_id = target_company_id
  );
$$;

CREATE OR REPLACE FUNCTION public.get_my_profile_email()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT LOWER(p.email)
  FROM public.profiles p
  WHERE p.id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_pending_invite_for_company(target_company_id UUID, expected_role TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.invitations i
    WHERE i.company_id = target_company_id
      AND i.accepted_at IS NULL
      AND LOWER(i.email) = public.get_my_profile_email()
      AND (expected_role IS NULL OR i.role = expected_role)
  );
$$;

-- Replace recursive policies with helper-function policies
DROP POLICY IF EXISTS "Members can read their company" ON companies;
DROP POLICY IF EXISTS "Admins can update their company" ON companies;
DROP POLICY IF EXISTS "Members can read co-members" ON company_members;
DROP POLICY IF EXISTS "Admins can add members" ON company_members;
DROP POLICY IF EXISTS "Admins can manage invitations" ON invitations;
DROP POLICY IF EXISTS "Invited users can accept invitation" ON invitations;
DROP POLICY IF EXISTS "Company members can read all their jobs" ON jobs;
DROP POLICY IF EXISTS "Company members can insert jobs" ON jobs;
DROP POLICY IF EXISTS "Company members can update their jobs" ON jobs;
DROP POLICY IF EXISTS "Company members can read applications for their jobs" ON applications;
DROP POLICY IF EXISTS "Company members can update application stage" ON applications;

CREATE POLICY "Members can read their company" ON companies FOR SELECT
  USING (public.is_company_member(id));

CREATE POLICY "Admins can update their company" ON companies FOR UPDATE
  USING (public.is_company_admin(id))
  WITH CHECK (public.is_company_admin(id));

CREATE POLICY "Members can read co-members" ON company_members FOR SELECT
  USING (public.is_company_member(company_id));

CREATE POLICY "Admins can add members" ON company_members FOR INSERT
  WITH CHECK (
    public.is_company_admin(company_id)
    OR (
      user_id = auth.uid()
      AND role = 'admin'
      AND public.is_first_company_member(company_id)
    )
    OR (
      user_id = auth.uid()
      AND public.has_pending_invite_for_company(company_id, role)
    )
  );

CREATE POLICY "Admins can manage invitations" ON invitations FOR ALL
  USING (public.is_company_admin(company_id))
  WITH CHECK (public.is_company_admin(company_id));

CREATE POLICY "Invited users can accept invitation" ON invitations FOR UPDATE
  USING (LOWER(email) = public.get_my_profile_email())
  WITH CHECK (LOWER(email) = public.get_my_profile_email() AND accepted_at IS NOT NULL);

CREATE POLICY "Company members can read all their jobs" ON jobs FOR SELECT
  USING (public.is_company_member(company_id));

CREATE POLICY "Company members can insert jobs" ON jobs FOR INSERT
  WITH CHECK (public.is_company_member(company_id));

CREATE POLICY "Company members can update their jobs" ON jobs FOR UPDATE
  USING (public.is_company_member(company_id))
  WITH CHECK (public.is_company_member(company_id));

CREATE POLICY "Company members can read applications for their jobs" ON applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM jobs j
      WHERE j.id = job_id
        AND public.is_company_member(j.company_id)
    )
  );

CREATE POLICY "Company members can update application stage" ON applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM jobs j
      WHERE j.id = job_id
        AND public.is_company_member(j.company_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM jobs j
      WHERE j.id = job_id
        AND public.is_company_member(j.company_id)
    )
  );

COMMIT;
