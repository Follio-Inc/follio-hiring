'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  User, Job, Application, ApplicationStage, ApplicationNote,
} from '@/lib/types';
import {
  mockUser, mockJobs, mockApplications,
} from '@/lib/mock-data';
import { generateId } from '@/lib/utils';
import { computeFitScore, generateAIAssessment } from '@/lib/ai-scoring';

interface AppState {
  user: User;
  jobs: Job[];
  applications: Application[];
  selectedJobId: string | null;
  compareIds: string[];
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
  addJob: (job: Omit<Job, 'id' | 'companyId' | 'createdAt' | 'applicantCount' | 'avgFitScore' | 'stageBreakdown' | 'aiSnapshot'>) => Job;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    user: mockUser,
    jobs: mockJobs,
    applications: [...mockApplications],
    selectedJobId: null,
    compareIds: [],
  });

  const selectJob = useCallback((jobId: string | null) => {
    setState(prev => ({ ...prev, selectedJobId: jobId }));
  }, []);

  const getJobApplications = useCallback((jobId: string) => {
    return state.applications.filter(a => a.jobId === jobId);
  }, [state.applications]);

  const getApplication = useCallback((candidateId: string, jobId: string) => {
    return state.applications.find(
      a => a.candidateId === candidateId && a.jobId === jobId
    );
  }, [state.applications]);

  const moveStage = useCallback((applicationId: string, stage: ApplicationStage) => {
    setState(prev => ({
      ...prev,
      applications: prev.applications.map(a =>
        a.id === applicationId ? { ...a, stage } : a
      ),
    }));
  }, []);

  const addNote = useCallback((applicationId: string, content: string) => {
    const note: ApplicationNote = {
      id: generateId(),
      authorId: state.user.id,
      authorName: state.user.name,
      content,
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      applications: prev.applications.map(a =>
        a.id === applicationId
          ? { ...a, notes: [...a.notes, note] }
          : a
      ),
    }));
  }, [state.user]);

  const setRating = useCallback((applicationId: string, rating: number) => {
    setState(prev => ({
      ...prev,
      applications: prev.applications.map(a =>
        a.id === applicationId ? { ...a, rating } : a
      ),
    }));
  }, []);

  const toggleCompare = useCallback((candidateId: string) => {
    setState(prev => {
      const exists = prev.compareIds.includes(candidateId);
      if (exists) {
        return { ...prev, compareIds: prev.compareIds.filter(id => id !== candidateId) };
      }
      if (prev.compareIds.length >= 3) return prev;
      return { ...prev, compareIds: [...prev.compareIds, candidateId] };
    });
  }, []);

  const clearCompare = useCallback(() => {
    setState(prev => ({ ...prev, compareIds: [] }));
  }, []);

  useEffect(() => {
    const loadSharedApplications = () => {
      fetch('/api/applications')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.data)) {
            setState(prev => {
              const existingIds = new Set(prev.applications.map(a => a.id));
              const newApps = data.data.filter((a: Application) => !existingIds.has(a.id));
              if (newApps.length === 0) return prev;
              return { ...prev, applications: [...prev.applications, ...newApps] };
            });
          }
        })
        .catch(() => {});
    };

    loadSharedApplications();
    const interval = setInterval(loadSharedApplications, 5000);
    return () => clearInterval(interval);
  }, []);

  const addJob = useCallback((jobData: Omit<Job, 'id' | 'companyId' | 'createdAt' | 'applicantCount' | 'avgFitScore' | 'stageBreakdown' | 'aiSnapshot'>) => {
    const newJob: Job = {
      ...jobData,
      id: `job_${generateId()}`,
      companyId: state.user.companyId,
      createdAt: new Date().toISOString(),
      applicantCount: 0,
      avgFitScore: 0,
      stageBreakdown: { new: 0, reviewing: 0, shortlisted: 0, interview: 0, offer: 0, rejected: 0 },
      aiSnapshot: {
        idealCandidate: `Looking for a ${jobData.experienceLevel} ${jobData.roleType} with expertise in ${jobData.requiredSkills.slice(0, 3).join(', ')}.`,
        evaluationCriteria: jobData.mustHave.slice(0, 5),
        keywords: jobData.requiredSkills.map(s => s.toLowerCase()),
      },
    };
    setState(prev => ({ ...prev, jobs: [...prev.jobs, newJob] }));

    fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newJob),
    }).catch(() => {});

    return newJob;
  }, [state.user.companyId]);

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
