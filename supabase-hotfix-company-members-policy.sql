-- Fix company member insert policy for company onboarding.
-- Apply in Supabase SQL Editor to update existing projects.

DROP POLICY IF EXISTS "Admins can add members" ON company_members;

CREATE POLICY "Admins can add members" ON company_members FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id
    FROM company_members
    WHERE user_id = auth.uid() AND role = 'admin'
  )
  OR NOT EXISTS (
    SELECT 1
    FROM company_members cm
    WHERE cm.company_id = company_members.company_id
  )
);
