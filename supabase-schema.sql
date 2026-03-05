-- ============================================================
-- Together Platform — Full Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('candidate', 'recruiter')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Candidate-specific profile data
CREATE TABLE IF NOT EXISTS candidate_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  location TEXT,
  experience_level TEXT DEFAULT 'mid',
  role_preferences TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  bio TEXT,
  portfolio_url TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  resume_url TEXT
);

-- 3. Companies
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT,
  logo_url TEXT,
  industry TEXT,
  size TEXT,
  description TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Company members (many recruiters per company)
CREATE TABLE IF NOT EXISTS company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'recruiter' CHECK (role IN ('admin', 'recruiter', 'manager')),
  invited_by UUID REFERENCES profiles(id),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, user_id)
);

-- 5. Invitations
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'recruiter',
  invited_by UUID NOT NULL REFERENCES profiles(id),
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Jobs
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  department TEXT,
  role_type TEXT NOT NULL,
  required_skills TEXT[] DEFAULT '{}',
  experience_level TEXT,
  description TEXT,
  must_have TEXT[] DEFAULT '{}',
  nice_to_have TEXT[] DEFAULT '{}',
  location TEXT DEFAULT 'Remote',
  location_type TEXT DEFAULT 'remote',
  salary_min INTEGER,
  salary_max INTEGER,
  currency TEXT DEFAULT 'USD',
  benefits TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Applications
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cover_note TEXT,
  resume_url TEXT,
  stage TEXT DEFAULT 'new',
  fit_score INTEGER,
  applied_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(job_id, candidate_id)
);

-- ============================================================
-- Auto-create profile on signup via trigger
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'candidate')
  );

  IF COALESCE(NEW.raw_user_meta_data->>'role', 'candidate') = 'candidate' THEN
    INSERT INTO public.candidate_profiles (id)
    VALUES (NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY "Anyone can read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Candidate profiles: candidates can manage own
CREATE POLICY "Read own candidate profile" ON candidate_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Update own candidate profile" ON candidate_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Insert own candidate profile" ON candidate_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Companies: readable by members, insertable by anyone (for signup)
CREATE POLICY "Anyone can create a company" ON companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Members can read their company" ON companies FOR SELECT
  USING (id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid()));
CREATE POLICY "Admins can update their company" ON companies FOR UPDATE
  USING (id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid() AND role = 'admin'));

-- Company members: members can read co-members, admins can insert
CREATE POLICY "Members can read co-members" ON company_members FOR SELECT
  USING (company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid()));
CREATE POLICY "Admins can add members" ON company_members FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid() AND role = 'admin')
    OR NOT EXISTS (SELECT 1 FROM company_members WHERE company_id = company_members.company_id));

-- Invitations: admins can manage, invited user can read own
CREATE POLICY "Admins can manage invitations" ON invitations FOR ALL
  USING (company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Anyone can read invitation by token" ON invitations FOR SELECT USING (true);

-- Jobs: anyone can read active, company members can manage
CREATE POLICY "Anyone can read active jobs" ON jobs FOR SELECT USING (status = 'active');
CREATE POLICY "Company members can read all their jobs" ON jobs FOR SELECT
  USING (company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid()));
CREATE POLICY "Company members can insert jobs" ON jobs FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid()));
CREATE POLICY "Company members can update their jobs" ON jobs FOR UPDATE
  USING (company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid()));

-- Applications: candidates can manage own, company members can read for their jobs
CREATE POLICY "Candidates can read own applications" ON applications FOR SELECT
  USING (candidate_id = auth.uid());
CREATE POLICY "Candidates can insert applications" ON applications FOR INSERT
  WITH CHECK (candidate_id = auth.uid());
CREATE POLICY "Company members can read applications for their jobs" ON applications FOR SELECT
  USING (job_id IN (SELECT id FROM jobs WHERE company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())));
CREATE POLICY "Company members can update application stage" ON applications FOR UPDATE
  USING (job_id IN (SELECT id FROM jobs WHERE company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())));
