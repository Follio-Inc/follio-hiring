'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'candidate' | 'recruiter';
  avatarUrl?: string;
  hasProfile: boolean;
}

interface CandidateProfileData {
  id: string;
  name?: string;
  location: string;
  experienceLevel: string;
  rolePreferences: string[];
  skills: string[];
  bio?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  resumeUrl?: string;
}

interface CompanyData {
  id: string;
  name: string;
  domain?: string;
  logoUrl?: string;
  industry?: string;
  size?: string;
  description?: string;
  website?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: (CandidateProfileData & { email: string; name: string; createdAt: string; updatedAt: string }) | null;
  company: CompanyData | null;
  companyRole: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string; role?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  signupCompany: (params: { name: string; email: string; password: string; companyName: string }) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<CandidateProfileData>) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function loadUserData(supabase: ReturnType<typeof createClient>, supabaseUser: SupabaseUser) {
  const { data: profileRow } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', supabaseUser.id)
    .single();

  if (!profileRow) return null;

  const authUser: AuthUser = {
    id: profileRow.id,
    email: profileRow.email,
    name: profileRow.name,
    role: profileRow.role,
    avatarUrl: profileRow.avatar_url ?? undefined,
    hasProfile: true,
  };

  let candidateProfile = null;
  let company: CompanyData | null = null;
  let companyRole: string | null = null;

  if (profileRow.role === 'candidate') {
    const { data: cp } = await supabase
      .from('candidate_profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    if (cp) {
      authUser.hasProfile = !!(cp.skills?.length || cp.location);
      candidateProfile = {
        id: cp.id,
        email: profileRow.email,
        name: profileRow.name,
        location: cp.location ?? '',
        experienceLevel: cp.experience_level ?? 'mid',
        rolePreferences: cp.role_preferences ?? [],
        skills: cp.skills ?? [],
        bio: cp.bio ?? undefined,
        portfolioUrl: cp.portfolio_url ?? undefined,
        githubUrl: cp.github_url ?? undefined,
        linkedinUrl: cp.linkedin_url ?? undefined,
        resumeUrl: cp.resume_url ?? undefined,
        createdAt: profileRow.created_at,
        updatedAt: profileRow.created_at,
      };
    }
  } else if (profileRow.role === 'recruiter') {
    const { data: membership } = await supabase
      .from('company_members')
      .select('role, companies(*)')
      .eq('user_id', supabaseUser.id)
      .single();

    if (membership) {
      companyRole = membership.role;
      const c = membership.companies as unknown as Record<string, string> | null;
      if (c) {
        company = {
          id: c.id,
          name: c.name,
          domain: c.domain ?? undefined,
          logoUrl: c.logo_url ?? undefined,
          industry: c.industry ?? undefined,
          size: c.size ?? undefined,
          description: c.description ?? undefined,
          website: c.website ?? undefined,
        };
      }
    }
  }

  return { authUser, candidateProfile, company, companyRole };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<AuthContextType['profile']>(null);
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [companyRole, setCompanyRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  const refreshProfile = useCallback(async () => {
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    if (!supabaseUser) {
      setUser(null);
      setProfile(null);
      setCompany(null);
      setCompanyRole(null);
      return;
    }

    const result = await loadUserData(supabase, supabaseUser);
    if (result) {
      setUser(result.authUser);
      setProfile(result.candidateProfile);
      setCompany(result.company);
      setCompanyRole(result.companyRole);
    }
  }, [supabase]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        if (supabaseUser) {
          const result = await loadUserData(supabase, supabaseUser);
          if (result) {
            setUser(result.authUser);
            setProfile(result.candidateProfile);
            setCompany(result.company);
            setCompanyRole(result.companyRole);
          }
        }
      } catch {
        // Session might not exist yet
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: { user: SupabaseUser } | null) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setCompany(null);
        setCompanyRole(null);
        setIsLoading(false);
        return;
      }

      if (session?.user) {
        const result = await loadUserData(supabase, session.user);
        if (result) {
          setUser(result.authUser);
          setProfile(result.candidateProfile);
          setCompany(result.company);
          setCompanyRole(result.companyRole);
        }
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    if (supabaseUser) {
      const result = await loadUserData(supabase, supabaseUser);
      if (result) {
        setUser(result.authUser);
        setProfile(result.candidateProfile);
        setCompany(result.company);
        setCompanyRole(result.companyRole);
        return { role: result.authUser.role };
      }
    }
    return {};
  }, [supabase]);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role: 'candidate' } },
    });
    if (error) return { error: error.message };

    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    if (supabaseUser) {
      const result = await loadUserData(supabase, supabaseUser);
      if (result) {
        setUser(result.authUser);
        setProfile(result.candidateProfile);
        setCompany(result.company);
        setCompanyRole(result.companyRole);
      }
    }
    return {};
  }, [supabase]);

  const signupCompany = useCallback(async (params: { name: string; email: string; password: string; companyName: string }) => {
    const { error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: { data: { name: params.name, role: 'recruiter' } },
    });
    if (error) return { error: error.message };

    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    if (!supabaseUser) return { error: 'Signup succeeded but failed to get user' };

    const { data: newCompany, error: companyError } = await supabase
      .from('companies')
      .insert({ name: params.companyName })
      .select()
      .single();

    if (companyError || !newCompany) return { error: companyError?.message || 'Failed to create company' };

    const { error: memberError } = await supabase
      .from('company_members')
      .insert({ company_id: newCompany.id, user_id: supabaseUser.id, role: 'admin' });

    if (memberError) return { error: memberError.message };

    await refreshProfile();
    return {};
  }, [supabase, refreshProfile]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setCompany(null);
    setCompanyRole(null);
  }, [supabase]);

  const updateProfile = useCallback((data: Partial<CandidateProfileData>) => {
    setProfile(prev => {
      if (!prev) return prev;
      return { ...prev, ...data, updatedAt: new Date().toISOString() };
    });

    if (user) {
      const dbData: Record<string, unknown> = {};
      if (data.location !== undefined) dbData.location = data.location;
      if (data.experienceLevel !== undefined) dbData.experience_level = data.experienceLevel;
      if (data.rolePreferences !== undefined) dbData.role_preferences = data.rolePreferences;
      if (data.skills !== undefined) dbData.skills = data.skills;
      if (data.bio !== undefined) dbData.bio = data.bio;
      if (data.portfolioUrl !== undefined) dbData.portfolio_url = data.portfolioUrl;
      if (data.githubUrl !== undefined) dbData.github_url = data.githubUrl;
      if (data.linkedinUrl !== undefined) dbData.linkedin_url = data.linkedinUrl;
      if (data.resumeUrl !== undefined) dbData.resume_url = data.resumeUrl;

      supabase.from('candidate_profiles').update(dbData).eq('id', user.id).then(() => {});

      if (data.name) {
        supabase.from('profiles').update({ name: data.name }).eq('id', user.id).then(() => {});
      }
    }
  }, [user, supabase]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        company,
        companyRole,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        signupCompany,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
