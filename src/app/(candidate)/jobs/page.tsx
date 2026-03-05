'use client';

import { useState, useMemo, useEffect } from 'react';
import { CandidateJobCard } from '@/components/candidate/job-card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { CandidateJob } from '@/lib/candidate-types';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const roleFilters = [
  { value: 'all', label: 'All Roles' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'design', label: 'Design' },
  { value: 'product', label: 'Product' },
  { value: 'data', label: 'Data' },
  { value: 'devops', label: 'DevOps' },
  { value: 'developer', label: 'Developer' },
  { value: 'designer', label: 'Designer' },
  { value: 'pm', label: 'PM' },
];

const locationFilters = [
  { value: 'all', label: 'Any Location' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
];

const seniorityFilters = [
  { value: 'all', label: 'Any Level' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid-level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead / Staff' },
];

export default function JobsPage() {
  const [search, setSearch] = useState('');
  const [roleType, setRoleType] = useState('all');
  const [locationType, setLocationType] = useState('all');
  const [seniority, setSeniority] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [allJobs, setAllJobs] = useState<CandidateJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/jobs')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setAllJobs(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = allJobs;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.name.toLowerCase().includes(q) ||
          j.requiredSkills.some((s) => s.toLowerCase().includes(q)),
      );
    }
    if (roleType !== 'all') result = result.filter((j) => j.roleType === roleType);
    if (locationType !== 'all') result = result.filter((j) => j.locationType === locationType);
    if (seniority !== 'all') result = result.filter((j) => j.experienceLevel === seniority);
    return result;
  }, [search, roleType, locationType, seniority, allJobs]);

  const activeFilterCount = (roleType !== 'all' ? 1 : 0) + (locationType !== 'all' ? 1 : 0) + (seniority !== 'all' ? 1 : 0);

  const clearFilters = () => {
    setRoleType('all');
    setLocationType('all');
    setSeniority('all');
    setSearch('');
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <p className="text-stone-500">Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800">Open Roles</h1>
        <p className="text-stone-500 mt-1">
          {filtered.length} {filtered.length === 1 ? 'role' : 'roles'} available
        </p>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input placeholder="Search by title, company, or skill..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer',
            showFilters || activeFilterCount > 0
              ? 'bg-amber-50 border-amber-300 text-amber-700'
              : 'bg-white/50 border-white/60 text-stone-600 hover:bg-white/70',
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">{activeFilterCount}</span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="mb-6 p-5 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/60 animate-slide-up space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-stone-700">Filters</h3>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1 cursor-pointer">
                <X className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>
          <div className="space-y-3">
            <FilterRow label="Role Type" options={roleFilters} value={roleType} onChange={setRoleType} />
            <FilterRow label="Location" options={locationFilters} value={locationType} onChange={setLocationType} />
            <FilterRow label="Seniority" options={seniorityFilters} value={seniority} onChange={setSeniority} />
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((job) => <CandidateJobCard key={job.id} job={job} />)
        ) : (
          <div className="text-center py-16">
            <p className="text-lg font-medium text-stone-600">No roles match your filters</p>
            <p className="text-sm text-stone-400 mt-1">Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="mt-4 text-sm text-amber-600 hover:text-amber-700 font-medium cursor-pointer">
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterRow({ label, options, value, onChange }: { label: string; options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">{label}</label>
      <div className="flex flex-wrap gap-1.5 mt-1.5">
        {options.map((f) => (
          <button
            key={f.value}
            onClick={() => onChange(f.value)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer',
              value === f.value ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white/30 border-white/40 text-stone-500 hover:bg-white/50',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
