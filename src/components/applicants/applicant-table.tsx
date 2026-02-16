'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUpDown,
  SlidersHorizontal,
  GitCompare,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Application } from '@/lib/types';
import { Avatar } from '@/components/ui/avatar';
import { FitScore } from '@/components/ui/fit-score';
import { StageBadge } from '@/components/ui/stage-badge';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/ui/star-rating';
import { cn, formatDate, getRoleIcon } from '@/lib/utils';
import { useApp } from '@/contexts/app-context';

interface ApplicantTableProps {
  applications: Application[];
  jobId: string;
}

type SortKey = 'fitScore' | 'experience' | 'appliedAt' | 'name';
type SortDir = 'asc' | 'desc';

export function ApplicantTable({ applications, jobId }: ApplicantTableProps) {
  const router = useRouter();
  const { toggleCompare, compareIds, setRating } = useApp();
  const [sortKey, setSortKey] = useState<SortKey>('fitScore');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [minFitScore, setMinFitScore] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = useMemo(() => {
    let filtered = applications;

    if (stageFilter !== 'all') {
      filtered = filtered.filter(a => a.stage === stageFilter);
    }
    if (minFitScore > 0) {
      filtered = filtered.filter(a => a.fitScore >= minFitScore);
    }

    return [...filtered].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortKey) {
        case 'fitScore':
          return (a.fitScore - b.fitScore) * dir;
        case 'experience':
          return (a.candidate.yearsOfExperience - b.candidate.yearsOfExperience) * dir;
        case 'appliedAt':
          return (new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime()) * dir;
        case 'name':
          return a.candidate.name.localeCompare(b.candidate.name) * dir;
        default:
          return 0;
      }
    });
  }, [applications, sortKey, sortDir, stageFilter, minFitScore]);

  const SortHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <button
      onClick={() => toggleSort(sortKeyName)}
      className={cn(
        'flex items-center gap-1 text-xs font-medium uppercase tracking-wider transition-colors',
        sortKey === sortKeyName ? 'text-violet-600' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {label}
      <ArrowUpDown size={12} />
    </button>
  );

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {sorted.length} applicant{sorted.length !== 1 ? 's' : ''}
          </span>
          {compareIds.length > 0 && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => router.push(`/compare?job=${jobId}`)}
            >
              <GitCompare size={14} className="mr-1.5" />
              Compare ({compareIds.length})
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={14} className="mr-1.5" />
            Filters
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex items-center gap-4 mb-4 p-3 bg-muted/50 rounded-2xl border border-border">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Stage</label>
            <select
              value={stageFilter}
              onChange={e => setStageFilter(e.target.value)}
              className="px-2 py-1 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              <option value="all">All stages</option>
              <option value="new">New</option>
              <option value="reviewing">Reviewing</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Min Fit Score</label>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={minFitScore}
              onChange={e => setMinFitScore(Number(e.target.value))}
              className="w-32 accent-violet-600"
            />
            <span className="ml-2 text-xs text-muted-foreground">{minFitScore}+</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left w-10">
                <span className="sr-only">Compare</span>
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader label="Candidate" sortKeyName="name" />
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</span>
              </th>
              <th className="px-4 py-3 text-center">
                <SortHeader label="Fit" sortKeyName="fitScore" />
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Top Strengths</span>
              </th>
              <th className="px-4 py-3 text-center">
                <SortHeader label="Exp" sortKeyName="experience" />
              </th>
              <th className="px-4 py-3 text-center">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Rating</span>
              </th>
              <th className="px-4 py-3 text-center">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</span>
              </th>
              <th className="px-4 py-3 text-right">
                <SortHeader label="Applied" sortKeyName="appliedAt" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(app => {
              const isSelected = compareIds.includes(app.candidateId);
              return (
                <tr
                  key={app.id}
                  className="border-b border-gray-50 hover:bg-violet-50/30 transition-colors cursor-pointer group"
                  onClick={() => router.push(`/candidates/${app.candidateId}?job=${jobId}`)}
                >
                  {/* Compare checkbox */}
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => toggleCompare(app.candidateId)}
                      className={cn(
                        'transition-colors',
                        isSelected ? 'text-violet-600' : 'text-gray-300 hover:text-gray-500'
                      )}
                    >
                      {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                    </button>
                  </td>

                  {/* Candidate */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={app.candidate.name} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-foreground group-hover:text-violet-600 transition-colors">
                          {app.candidate.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{app.candidate.title}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role Type */}
                  <td className="px-4 py-3">
                    <span className="text-sm">
                      {getRoleIcon(app.candidate.roleType)}{' '}
                      <span className="text-muted-foreground capitalize">{app.candidate.roleType}</span>
                    </span>
                  </td>

                  {/* Fit Score */}
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <FitScore score={app.fitScore} size="sm" />
                    </div>
                  </td>

                  {/* Strengths */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {app.aiSummary.strengths.slice(0, 2).map((s, i) => (
                        <span key={i} className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded truncate max-w-[140px]">
                          {s.length > 30 ? s.substring(0, 30) + '...' : s}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Experience */}
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-foreground">{app.candidate.yearsOfExperience}yr</span>
                  </td>

                  {/* Rating */}
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-center">
                      <StarRating
                        rating={app.rating}
                        onChange={(r) => setRating(app.id, r)}
                        size="sm"
                      />
                    </div>
                  </td>

                  {/* Stage */}
                  <td className="px-4 py-3 text-center">
                    <StageBadge stage={app.stage} />
                  </td>

                  {/* Applied Date */}
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs text-muted-foreground">{formatDate(app.appliedAt)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {sorted.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-sm">No applicants match the current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
