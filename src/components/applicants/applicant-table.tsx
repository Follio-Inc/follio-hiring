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
        'flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors',
        sortKey === sortKeyName ? 'text-amber-700' : 'text-stone-400 hover:text-stone-600'
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
          <span className="text-sm text-stone-400">
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

        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={14} className="mr-1.5" />
          Filters
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex items-center gap-4 mb-4 p-4 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50">
          <div>
            <label className="block text-xs font-semibold text-stone-400 mb-1.5 uppercase tracking-wider">Stage</label>
            <select
              value={stageFilter}
              onChange={e => setStageFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-white/50 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
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
            <label className="block text-xs font-semibold text-stone-400 mb-1.5 uppercase tracking-wider">Min Fit Score</label>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={minFitScore}
              onChange={e => setMinFitScore(Number(e.target.value))}
              className="w-32 accent-amber-600"
            />
            <span className="ml-2 text-xs text-stone-400 tabular-nums">{minFitScore}+</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/40">
              <th className="px-4 py-3.5 text-left w-10">
                <span className="sr-only">Compare</span>
              </th>
              <th className="px-4 py-3.5 text-left">
                <SortHeader label="Candidate" sortKeyName="name" />
              </th>
              <th className="px-4 py-3.5 text-left">
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Role</span>
              </th>
              <th className="px-4 py-3.5 text-center">
                <SortHeader label="Fit" sortKeyName="fitScore" />
              </th>
              <th className="px-4 py-3.5 text-left">
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Top Strengths</span>
              </th>
              <th className="px-4 py-3.5 text-center">
                <SortHeader label="Exp" sortKeyName="experience" />
              </th>
              <th className="px-4 py-3.5 text-center">
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Rating</span>
              </th>
              <th className="px-4 py-3.5 text-center">
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Status</span>
              </th>
              <th className="px-4 py-3.5 text-right">
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
                  className="border-b border-white/30 hover:bg-white/30 transition-all duration-150 cursor-pointer group"
                  onClick={() => router.push(`/candidates/${app.candidateId}?job=${jobId}`)}
                >
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => toggleCompare(app.candidateId)}
                      className={cn(
                        'transition-colors',
                        isSelected ? 'text-amber-600' : 'text-stone-300 hover:text-stone-500'
                      )}
                    >
                      {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                    </button>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={app.candidate.name} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-foreground group-hover:text-amber-700 transition-colors">
                          {app.candidate.name}
                        </p>
                        <p className="text-xs text-stone-400">{app.candidate.title}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span className="text-sm">
                      {getRoleIcon(app.candidate.roleType)}{' '}
                      <span className="text-stone-400 capitalize">{app.candidate.roleType}</span>
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <FitScore score={app.fitScore} size="sm" />
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {app.aiSummary.strengths.slice(0, 2).map((s, i) => (
                        <span key={i} className="text-xs text-stone-500 bg-white/50 backdrop-blur-sm px-1.5 py-0.5 rounded-md truncate max-w-[140px]">
                          {s.length > 30 ? s.substring(0, 30) + '...' : s}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-foreground tabular-nums">{app.candidate.yearsOfExperience}yr</span>
                  </td>

                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-center">
                      <StarRating
                        rating={app.rating}
                        onChange={(r) => setRating(app.id, r)}
                        size="sm"
                      />
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <StageBadge stage={app.stage} />
                  </td>

                  <td className="px-4 py-3 text-right">
                    <span className="text-xs text-stone-400">{formatDate(app.appliedAt)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {sorted.length === 0 && (
          <div className="py-12 text-center text-stone-400">
            <p className="text-sm">No applicants match the current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
