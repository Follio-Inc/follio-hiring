-- Full RLS hardening for recruiter and candidate company scoping.
-- Apply in Supabase SQL Editor to update existing projects.

BEGIN;

-- Candidate profiles: add company scope column.
ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS company_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'candidate_profiles_company_id_fkey'
  ) THEN
    ALTER TABLE public.candidate_profiles
      ADD CONSTRAINT candidate_profiles_company_id_fkey
      FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_candidate_profiles_company_id
  ON public.candidate_profiles(company_id);

-- Ensure signup trigger stores candidate company selection.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _company_id UUID;
  _candidate_company_id UUID;
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'candidate')
  );

  IF COALESCE(NEW.raw_user_meta_data->>'role', 'candidate') = 'candidate' THEN
    BEGIN
      _candidate_company_id := NULLIF(NEW.raw_user_meta_data->>'company_id', '')::UUID;
    EXCEPTION
      WHEN OTHERS THEN
        _candidate_company_id := NULL;
    END;

    INSERT INTO public.candidate_profiles (id, company_id)
    VALUES (NEW.id, _candidate_company_id);
  ELSIF NEW.raw_user_meta_data->>'company_name' IS NOT NULL THEN
    INSERT INTO public.companies (name)
    VALUES (NEW.raw_user_meta_data->>'company_name')
    RETURNING id INTO _company_id;

    INSERT INTO public.company_members (company_id, user_id, role)
    VALUES (_company_id, NEW.id, 'admin');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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

CREATE OR REPLACE FUNCTION public.get_candidate_company_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT cp.company_id
  FROM public.candidate_profiles cp
  WHERE cp.id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.list_companies_for_signup()
RETURNS TABLE(id UUID, name TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.name
  FROM public.companies c
  ORDER BY c.name ASC;
$$;

-- Replace recursive/restrictive policies with helper-function policies
DROP POLICY IF EXISTS "Members can read their company" ON companies;
DROP POLICY IF EXISTS "Admins can update their company" ON companies;
DROP POLICY IF EXISTS "Members can read co-members" ON company_members;
DROP POLICY IF EXISTS "Admins can add members" ON company_members;
DROP POLICY IF EXISTS "Admins can manage invitations" ON invitations;
DROP POLICY IF EXISTS "Invited users can accept invitation" ON invitations;
DROP POLICY IF EXISTS "Anyone can read active jobs" ON jobs;
DROP POLICY IF EXISTS "Candidates can read active jobs in selected company" ON jobs;
DROP POLICY IF EXISTS "Company members can read all their jobs" ON jobs;
DROP POLICY IF EXISTS "Company members can insert jobs" ON jobs;
DROP POLICY IF EXISTS "Company members can update their jobs" ON jobs;
DROP POLICY IF EXISTS "Candidates can insert applications" ON applications;
DROP POLICY IF EXISTS "Company members can read applications for their jobs" ON applications;
DROP POLICY IF EXISTS "Company members can update application stage" ON applications;

CREATE POLICY "Members can read their company" ON companies FOR SELECT
  USING (public.is_company_member(id) OR id = public.get_candidate_company_id());

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

CREATE POLICY "Candidates can read active jobs in selected company" ON jobs FOR SELECT
  USING (status = 'active' AND company_id = public.get_candidate_company_id());

CREATE POLICY "Company members can read all their jobs" ON jobs FOR SELECT
  USING (public.is_company_member(company_id));

CREATE POLICY "Company members can insert jobs" ON jobs FOR INSERT
  WITH CHECK (public.is_company_member(company_id));

CREATE POLICY "Company members can update their jobs" ON jobs FOR UPDATE
  USING (public.is_company_member(company_id))
  WITH CHECK (public.is_company_member(company_id));

CREATE POLICY "Candidates can insert applications" ON applications FOR INSERT
  WITH CHECK (
    candidate_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM jobs j
      WHERE j.id = job_id
        AND j.status = 'active'
        AND j.company_id = public.get_candidate_company_id()
    )
  );

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
