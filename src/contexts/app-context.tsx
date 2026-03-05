'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, Job, Application, ApplicationStage, ApplicationNote } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';

interface AppState {
  user: User;
  jobs: Job[];
  applications: Application[];
  selectedJobId: string | null;
  compareIds: string[];
  isLoading: boolean;
}

interface AppContextType extends AppState {
  selectJob: (jobId: string | null) => void;
  getJobApplications: (jobId: string) => Application[];
  getApplication: (candidateId: string, jobId: string) => Application | undefined;
  moveStage: (applicationId: string, stage: ApplicationStage) => void;
  addNote: (applicationId: string, content: string) => void;
  setRating: (applicationId: string, rating: number) => void;
  toggleCompare: (candidateId: string) => void;
  clearCompare: () => void;
  addJob: (job: Omit<Job, 'id' | 'companyId' | 'createdAt' | 'applicantCount' | 'avgFitScore' | 'stageBreakdown' | 'aiSnapshot'>) => void;
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser, company } = useAuth();

  const fallbackUser: User = {
    id: authUser?.id || '',
    name: authUser?.name || '',
    email: authUser?.email || '',
    role: 'recruiter',
    companyId: company?.id || '',
    avatarUrl: authUser?.avatarUrl,
  };

  const [state, setState] = useState<AppState>({
    user: fallbackUser,
    jobs: [],
    applications: [],
    selectedJobId: null,
    compareIds: [],
    isLoading: true,
  });

  const loadData = useCallback(() => {
    Promise.all([
      fetch('/api/hiring/jobs').then((r) => r.json()),
      fetch('/api/hiring/applications').then((r) => r.json()),
    ])
      .then(([jobsRes, appsRes]) => {
        setState((prev) => ({
          ...prev,
          jobs: jobsRes.success ? jobsRes.data : [],
          applications: appsRes.success ? appsRes.data : [],
          isLoading: false,
        }));
      })
      .catch(() => {
        setState((prev) => ({ ...prev, isLoading: false }));
      });
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    setState((prev) => ({ ...prev, user: fallbackUser }));
  }, [authUser?.id, authUser?.name, company?.id]);

  const selectJob = useCallback((jobId: string | null) => {
    setState((prev) => ({ ...prev, selectedJobId: jobId }));
  }, []);

  const getJobApplications = useCallback(
    (jobId: string) => state.applications.filter((a) => a.jobId === jobId),
    [state.applications],
  );

  const getApplication = useCallback(
    (candidateId: string, jobId: string) => state.applications.find((a) => a.candidateId === candidateId && a.jobId === jobId),
    [state.applications],
  );

  const moveStage = useCallback((applicationId: string, stage: ApplicationStage) => {
    setState((prev) => ({
      ...prev,
      applications: prev.applications.map((a) => (a.id === applicationId ? { ...a, stage } : a)),
    }));

    fetch('/api/hiring/applications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId, stage }),
    }).catch(() => {});
  }, []);

  const addNote = useCallback(
    (applicationId: string, content: string) => {
      const note: ApplicationNote = {
        id: generateId(),
        authorId: state.user.id,
        authorName: state.user.name,
        content,
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        applications: prev.applications.map((a) =>
          a.id === applicationId ? { ...a, notes: [...(a.notes || []), note] } : a,
        ),
      }));
    },
    [state.user],
  );

  const setRating = useCallback((applicationId: string, rating: number) => {
    setState((prev) => ({
      ...prev,
      applications: prev.applications.map((a) => (a.id === applicationId ? { ...a, rating } : a)),
    }));
  }, []);

  const toggleCompare = useCallback((candidateId: string) => {
    setState((prev) => {
      const exists = prev.compareIds.includes(candidateId);
      if (exists) return { ...prev, compareIds: prev.compareIds.filter((id) => id !== candidateId) };
      if (prev.compareIds.length >= 3) return prev;
      return { ...prev, compareIds: [...prev.compareIds, candidateId] };
    });
  }, []);

  const clearCompare = useCallback(() => {
    setState((prev) => ({ ...prev, compareIds: [] }));
  }, []);

  const addJob = useCallback(
    (jobData: Omit<Job, 'id' | 'companyId' | 'createdAt' | 'applicantCount' | 'avgFitScore' | 'stageBreakdown' | 'aiSnapshot'>) => {
      fetch('/api/hiring/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      })
        .then((r) => r.json())
        .then((res) => {
          if (res.success) loadData();
        })
        .catch(() => {});
    },
    [loadData],
  );

  return (
    <AppContext.Provider
      value={{
        ...state,
        selectJob,
        getJobApplications,
        getApplication,
        moveStage,
        addNote,
        setRating,
        toggleCompare,
        clearCompare,
        addJob,
        refreshData: loadData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
