'use client';

import { useState } from 'react';
import {
  X,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Send,
  GitBranch,
  Star,
  Palette,
  Target,
  TrendingUp,
} from 'lucide-react';
import { Application, ApplicationStage, STAGE_ORDER, STAGE_CONFIG } from '@/lib/types';
import { Avatar } from '@/components/ui/avatar';
import { FitScore, FitScoreBar } from '@/components/ui/fit-score';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/ui/star-rating';
import { cn, formatDate, getRoleIcon } from '@/lib/utils';
import { useApp } from '@/contexts/app-context';

interface CandidateDetailProps {
  application: Application;
  onClose: () => void;
}

export function CandidateDetail({ application, onClose }: CandidateDetailProps) {
  const { moveStage, addNote, setRating } = useApp();
  const [noteInput, setNoteInput] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'notes'>('overview');
  const { candidate } = application;

  const handleAddNote = () => {
    if (noteInput.trim()) {
      addNote(application.id, noteInput.trim());
      setNoteInput('');
    }
  };

  const handleStageChange = (stage: ApplicationStage) => {
    moveStage(application.id, stage);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/15 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white/80 backdrop-blur-2xl shadow-2xl shadow-black/10 overflow-y-auto animate-slide-in">
        {/* Header */}
        <div className="sticky top-0 bg-white/70 backdrop-blur-2xl border-b border-white/50 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <Avatar name={candidate.name} size="lg" />
              <div>
                <h2 className="text-lg font-bold text-foreground tracking-tight">{candidate.name}</h2>
                <p className="text-sm text-stone-400">{candidate.title} · {candidate.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FitScore score={application.fitScore} size="md" showLabel />
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/60 text-stone-400 hover:text-stone-600 transition-all duration-200"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="px-6 pb-3 flex items-center gap-2 flex-wrap">
            <Button size="sm" variant="success" onClick={() => handleStageChange('shortlisted')}>
              <CheckCircle2 size={14} className="mr-1" /> Shortlist
            </Button>
            <Button size="sm" variant="danger" onClick={() => handleStageChange('rejected')}>
              <X size={14} className="mr-1" /> Reject
            </Button>
            <select
              value={application.stage}
              onChange={e => handleStageChange(e.target.value as ApplicationStage)}
              className="px-3 py-1.5 text-xs font-semibold border border-white/50 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
            >
              {STAGE_ORDER.map(stage => (
                <option key={stage} value={stage}>{STAGE_CONFIG[stage].label}</option>
              ))}
            </select>
            <div className="ml-auto">
              <StarRating
                rating={application.rating}
                onChange={r => setRating(application.id, r)}
              />
            </div>
          </div>

          <div className="px-6 flex gap-5 border-t border-white/40">
            {(['overview', 'profile', 'notes'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'py-3 text-sm font-semibold border-b-2 transition-all duration-200 capitalize',
                  activeTab === tab
                    ? 'border-amber-600 text-amber-700'
                    : 'border-transparent text-stone-400 hover:text-stone-600'
                )}
              >
                {tab}
                {tab === 'notes' && application.notes.length > 0 && (
                  <span className="ml-1.5 text-xs bg-white/50 text-stone-500 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                    {application.notes.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && <OverviewTab application={application} />}
          {activeTab === 'profile' && <ProfileTab application={application} />}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                  placeholder="Add a note..."
                  className="flex-1 px-4 py-2.5 text-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white/50 backdrop-blur-sm transition-all placeholder:text-stone-400"
                />
                <Button size="md" onClick={handleAddNote} disabled={!noteInput.trim()} className="!rounded-xl">
                  <Send size={14} />
                </Button>
              </div>

              {application.notes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-white/50 backdrop-blur-sm border border-white/60 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Send size={18} className="text-stone-400" />
                  </div>
                  <p className="text-sm text-stone-400">No notes yet. Add the first one.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...application.notes].reverse().map(note => (
                    <div key={note.id} className="p-4 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/50">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-foreground">{note.authorName}</span>
                        <span className="text-xs text-stone-400">{formatDate(note.createdAt)}</span>
                      </div>
                      <p className="text-sm text-stone-500 leading-relaxed">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ application }: { application: Application }) {
  const { candidate, aiSummary, fitScore } = application;

  return (
    <div className="space-y-6">
      <div className="p-5 bg-gradient-to-br from-amber-50/50 via-yellow-50/30 to-orange-50/20 backdrop-blur-sm border border-amber-200/30 rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-amber-600" />
          <h3 className="text-sm font-bold text-amber-900">AI Assessment</h3>
        </div>
        <p className="text-sm text-amber-800/60 leading-relaxed">{aiSummary.summary}</p>
      </div>

      <FitScoreBar score={fitScore} />

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Experience', value: `${candidate.yearsOfExperience}yr` },
          { label: 'Role', value: getRoleIcon(candidate.roleType) },
          { label: 'Skills Match', value: candidate.skills.length.toString() },
        ].map(stat => (
          <div key={stat.label} className="p-4 bg-white/40 backdrop-blur-sm border border-white/50 rounded-2xl text-center">
            <p className="text-xs text-stone-400 mb-1">{stat.label}</p>
            <p className="text-xl font-bold text-foreground tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">Skills</h4>
        <div className="flex flex-wrap gap-1.5">
          {candidate.skills.map(skill => (
            <Badge key={skill} variant="info" size="sm">{skill}</Badge>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
          <CheckCircle2 size={15} className="text-emerald-500" /> Strengths
        </h4>
        <ul className="space-y-1.5">
          {aiSummary.strengths.map((s, i) => (
            <li key={i} className="text-sm text-stone-500 flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
              {s}
            </li>
          ))}
        </ul>
      </div>

      {aiSummary.risks.length > 0 && aiSummary.risks[0] !== 'No significant risks identified' && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <AlertTriangle size={15} className="text-amber-500" /> Risk Flags
          </h4>
          <ul className="space-y-1.5">
            {aiSummary.risks.map((r, i) => (
              <li key={i} className="text-sm text-stone-500 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
          <Target size={15} className="text-amber-500" /> Interview Focus Areas
        </h4>
        <ul className="space-y-1.5">
          {aiSummary.interviewFocusAreas.map((area, i) => (
            <li key={i} className="text-sm text-stone-500 flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
              {area}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ProfileTab({ application }: { application: Application }) {
  const { candidate, aiSummary } = application;

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">About</h4>
        <p className="text-sm text-stone-500 leading-relaxed">{candidate.bio}</p>
        {candidate.portfolioUrl && (
          <a href={candidate.portfolioUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-amber-700 hover:text-amber-800 font-medium mt-2 transition-colors">
            View Portfolio <ExternalLink size={13} />
          </a>
        )}
      </div>

      {candidate.roleType === 'developer' && candidate.github && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5 tracking-tight">
            <GitBranch size={15} className="text-stone-400" /> GitHub Profile
          </h4>
          {aiSummary.technicalSummary && (
            <div className="p-4 bg-white/40 backdrop-blur-sm border border-white/50 rounded-2xl">
              <p className="text-sm text-stone-500 leading-relaxed">{aiSummary.technicalSummary}</p>
            </div>
          )}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Repos', value: candidate.github.repos },
              { label: 'Stars', value: candidate.github.stars },
              { label: 'Contributions', value: candidate.github.contributions },
            ].map(stat => (
              <div key={stat.label} className="p-4 bg-white/40 backdrop-blur-sm border border-white/50 rounded-2xl text-center">
                <p className="text-xs text-stone-400">{stat.label}</p>
                <p className="text-xl font-bold text-foreground tabular-nums">{stat.value}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-400 mb-1.5">Top Languages</p>
            <div className="flex gap-1.5">
              {candidate.github.topLanguages.map(lang => (
                <Badge key={lang} variant="neutral">{lang}</Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-400 mb-2">Top Projects</p>
            <div className="space-y-2">
              {candidate.github.topProjects.map(project => (
                <div key={project.name} className="p-4 bg-white/40 backdrop-blur-sm border border-white/50 rounded-2xl hover:bg-white/60 transition-all duration-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-foreground">{project.name}</span>
                    <span className="flex items-center gap-1 text-xs text-stone-400">
                      <Star size={12} className="text-amber-400" fill="currentColor" /> {project.stars}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400">{project.description}</p>
                  <Badge variant="neutral" size="sm" className="mt-2">{project.language}</Badge>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-400 mb-2">12-Month Activity</p>
            <div className="flex items-end gap-1 h-16">
              {candidate.github.activityData.map((value, i) => {
                const maxVal = Math.max(...candidate.github!.activityData);
                const height = (value / maxVal) * 100;
                return (
                  <div key={i} className="flex-1 bg-amber-400 rounded-t opacity-50 hover:opacity-100 transition-all duration-200"
                    style={{ height: `${height}%` }} title={`Month ${i + 1}: ${value} contributions`} />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {candidate.roleType === 'designer' && candidate.designPortfolio && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5 tracking-tight">
            <Palette size={15} className="text-stone-400" /> Design Portfolio
          </h4>
          {aiSummary.designSummary && (
            <div className="p-4 bg-white/40 backdrop-blur-sm border border-white/50 rounded-2xl">
              <p className="text-sm text-stone-500 leading-relaxed">{aiSummary.designSummary}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Projects', value: candidate.designPortfolio.projectCount },
              { label: 'Visual Quality', value: `${candidate.designPortfolio.visualQualityScore}/100` },
            ].map(stat => (
              <div key={stat.label} className="p-4 bg-white/40 backdrop-blur-sm border border-white/50 rounded-2xl text-center">
                <p className="text-xs text-stone-400">{stat.label}</p>
                <p className="text-xl font-bold text-foreground tabular-nums">{stat.value}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-400 mb-1.5">Design Tools</p>
            <div className="flex gap-1.5 flex-wrap">
              {candidate.designPortfolio.tools.map(tool => (<Badge key={tool} variant="neutral">{tool}</Badge>))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-400 mb-2">Featured Projects</p>
            <div className="grid grid-cols-2 gap-3">
              {candidate.designPortfolio.featuredProjects.map(project => (
                <div key={project.title} className="border border-white/50 rounded-2xl overflow-hidden bg-white/30 backdrop-blur-sm hover:bg-white/50 transition-all duration-200">
                  <div className="h-24 bg-gradient-to-br from-amber-50 to-orange-100/80 flex items-center justify-center">
                    <Palette size={24} className="text-amber-300" />
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold text-foreground">{project.title}</p>
                    <p className="text-xs text-stone-400">{project.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {candidate.roleType === 'pm' && candidate.pmProfile && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5 tracking-tight">
            <TrendingUp size={15} className="text-stone-400" /> Product Management Profile
          </h4>
          {aiSummary.productSummary && (
            <div className="p-4 bg-white/40 backdrop-blur-sm border border-white/50 rounded-2xl">
              <p className="text-sm text-stone-500 leading-relaxed">{aiSummary.productSummary}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Products Shipped', value: candidate.pmProfile.productsShipped },
              { label: 'Case Studies', value: candidate.pmProfile.caseStudies.length },
            ].map(stat => (
              <div key={stat.label} className="p-4 bg-white/40 backdrop-blur-sm border border-white/50 rounded-2xl text-center">
                <p className="text-xs text-stone-400">{stat.label}</p>
                <p className="text-xl font-bold text-foreground tabular-nums">{stat.value}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-400 mb-1.5">Impact Metrics</p>
            <div className="flex gap-1.5 flex-wrap">
              {candidate.pmProfile.impactMetrics.map(m => (<Badge key={m} variant="success">{m}</Badge>))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-400 mb-2">Case Studies</p>
            <div className="space-y-2">
              {candidate.pmProfile.caseStudies.map(cs => (
                <div key={cs.title} className="p-4 bg-white/40 backdrop-blur-sm border border-white/50 rounded-2xl hover:bg-white/60 transition-all duration-200">
                  <p className="text-sm font-semibold text-foreground mb-1">{cs.title}</p>
                  <p className="text-xs text-stone-400 mb-2">{cs.impact}</p>
                  <div className="flex gap-1 flex-wrap">
                    {cs.metrics.map(m => (
                      <span key={m} className="text-xs bg-emerald-50/80 text-emerald-700 px-2 py-0.5 rounded-lg font-medium backdrop-blur-sm">{m}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
