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
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-2xl bg-white shadow-2xl shadow-stone-300/30 overflow-y-auto animate-slide-in">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-stone-200/80 z-10">
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
                className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-all duration-200"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
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
              className="px-3 py-1.5 text-xs font-semibold border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all"
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

          {/* Tabs */}
          <div className="px-6 flex gap-5 border-t border-stone-100">
            {(['overview', 'profile', 'notes'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'py-3 text-sm font-semibold border-b-2 transition-all duration-200 capitalize',
                  activeTab === tab
                    ? 'border-violet-700 text-violet-700'
                    : 'border-transparent text-stone-400 hover:text-stone-600'
                )}
              >
                {tab}
                {tab === 'notes' && application.notes.length > 0 && (
                  <span className="ml-1.5 text-xs bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-full">
                    {application.notes.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <OverviewTab application={application} />
          )}
          {activeTab === 'profile' && (
            <ProfileTab application={application} />
          )}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {/* Note input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                  placeholder="Add a note..."
                  className="flex-1 px-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all placeholder:text-stone-400"
                />
                <Button size="md" onClick={handleAddNote} disabled={!noteInput.trim()} className="!rounded-xl">
                  <Send size={14} />
                </Button>
              </div>

              {/* Notes list */}
              {application.notes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Send size={18} className="text-stone-400" />
                  </div>
                  <p className="text-sm text-stone-400">No notes yet. Add the first one.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...application.notes].reverse().map(note => (
                    <div key={note.id} className="p-4 bg-stone-50/80 rounded-2xl border border-stone-100">
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
      {/* AI Summary */}
      <div className="p-5 bg-gradient-to-br from-violet-50/80 via-purple-50/60 to-indigo-50/40 border border-violet-100/60 rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-violet-600" />
          <h3 className="text-sm font-bold text-violet-900">AI Assessment</h3>
        </div>
        <p className="text-sm text-violet-800/80 leading-relaxed">{aiSummary.summary}</p>
      </div>

      {/* Fit Score Bar */}
      <FitScoreBar score={fitScore} />

      {/* Key Info */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-stone-50/80 border border-stone-100 rounded-2xl text-center">
          <p className="text-xs text-stone-400 mb-1">Experience</p>
          <p className="text-xl font-bold text-foreground tabular-nums">{candidate.yearsOfExperience}yr</p>
        </div>
        <div className="p-4 bg-stone-50/80 border border-stone-100 rounded-2xl text-center">
          <p className="text-xs text-stone-400 mb-1">Role</p>
          <p className="text-xl font-bold text-foreground">{getRoleIcon(candidate.roleType)}</p>
        </div>
        <div className="p-4 bg-stone-50/80 border border-stone-100 rounded-2xl text-center">
          <p className="text-xs text-stone-400 mb-1">Skills Match</p>
          <p className="text-xl font-bold text-foreground tabular-nums">{candidate.skills.length}</p>
        </div>
      </div>

      {/* Skills */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">Skills</h4>
        <div className="flex flex-wrap gap-1.5">
          {candidate.skills.map(skill => (
            <Badge key={skill} variant="info" size="sm">{skill}</Badge>
          ))}
        </div>
      </div>

      {/* Strengths */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
          <CheckCircle2 size={15} className="text-emerald-500" />
          Strengths
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

      {/* Risks */}
      {aiSummary.risks.length > 0 && aiSummary.risks[0] !== 'No significant risks identified' && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <AlertTriangle size={15} className="text-amber-500" />
            Risk Flags
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

      {/* Interview Focus */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
          <Target size={15} className="text-violet-500" />
          Interview Focus Areas
        </h4>
        <ul className="space-y-1.5">
          {aiSummary.interviewFocusAreas.map((area, i) => (
            <li key={i} className="text-sm text-stone-500 flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
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
      {/* Bio */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">About</h4>
        <p className="text-sm text-stone-500 leading-relaxed">{candidate.bio}</p>
        {candidate.portfolioUrl && (
          <a
            href={candidate.portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-violet-700 hover:text-violet-800 font-medium mt-2 transition-colors"
          >
            View Portfolio <ExternalLink size={13} />
          </a>
        )}
      </div>

      {/* Developer Profile */}
      {candidate.roleType === 'developer' && candidate.github && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5 tracking-tight">
            <GitBranch size={15} className="text-stone-400" />
            GitHub Profile
          </h4>

          {aiSummary.technicalSummary && (
            <div className="p-4 bg-stone-50/80 border border-stone-100 rounded-2xl">
              <p className="text-sm text-stone-500 leading-relaxed">{aiSummary.technicalSummary}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-stone-50/80 border border-stone-100 rounded-2xl text-center">
              <p className="text-xs text-stone-400">Repos</p>
              <p className="text-xl font-bold text-foreground tabular-nums">{candidate.github.repos}</p>
            </div>
            <div className="p-4 bg-stone-50/80 border border-stone-100 rounded-2xl text-center">
              <p className="text-xs text-stone-400">Stars</p>
              <p className="text-xl font-bold text-foreground tabular-nums">{candidate.github.stars}</p>
            </div>
            <div className="p-4 bg-stone-50/80 border border-stone-100 rounded-2xl text-center">
              <p className="text-xs text-stone-400">Contributions</p>
              <p className="text-xl font-bold text-foreground tabular-nums">{candidate.github.contributions}</p>
            </div>
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
                <div key={project.name} className="p-4 border border-stone-200/80 rounded-2xl hover:shadow-md hover:shadow-stone-100/50 transition-all duration-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-foreground">{project.name}</span>
                    <span className="flex items-center gap-1 text-xs text-stone-400">
                      <Star size={12} className="text-amber-400" fill="currentColor" />
                      {project.stars}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400">{project.description}</p>
                  <Badge variant="neutral" size="sm" className="mt-2">{project.language}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Graph */}
          <div>
            <p className="text-xs font-semibold text-stone-400 mb-2">12-Month Activity</p>
            <div className="flex items-end gap-1 h-16">
              {candidate.github.activityData.map((value, i) => {
                const maxVal = Math.max(...candidate.github!.activityData);
                const height = (value / maxVal) * 100;
                return (
                  <div
                    key={i}
                    className="flex-1 bg-violet-400 rounded-t opacity-60 hover:opacity-100 transition-all duration-200"
                    style={{ height: `${height}%` }}
                    title={`Month ${i + 1}: ${value} contributions`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Designer Profile */}
      {candidate.roleType === 'designer' && candidate.designPortfolio && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5 tracking-tight">
            <Palette size={15} className="text-stone-400" />
            Design Portfolio
          </h4>

          {aiSummary.designSummary && (
            <div className="p-4 bg-stone-50/80 border border-stone-100 rounded-2xl">
              <p className="text-sm text-stone-500 leading-relaxed">{aiSummary.designSummary}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-stone-50/80 border border-stone-100 rounded-2xl text-center">
              <p className="text-xs text-stone-400">Projects</p>
              <p className="text-xl font-bold text-foreground tabular-nums">{candidate.designPortfolio.projectCount}</p>
            </div>
            <div className="p-4 bg-stone-50/80 border border-stone-100 rounded-2xl text-center">
              <p className="text-xs text-stone-400">Visual Quality</p>
              <p className="text-xl font-bold text-foreground tabular-nums">{candidate.designPortfolio.visualQualityScore}/100</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-stone-400 mb-1.5">Design Tools</p>
            <div className="flex gap-1.5 flex-wrap">
              {candidate.designPortfolio.tools.map(tool => (
                <Badge key={tool} variant="neutral">{tool}</Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-stone-400 mb-2">Featured Projects</p>
            <div className="grid grid-cols-2 gap-3">
              {candidate.designPortfolio.featuredProjects.map(project => (
                <div key={project.title} className="border border-stone-200/80 rounded-2xl overflow-hidden hover:shadow-md hover:shadow-stone-100/50 transition-all duration-200">
                  <div className="h-24 bg-gradient-to-br from-violet-50 to-purple-100/80 flex items-center justify-center">
                    <Palette size={24} className="text-violet-300" />
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

      {/* PM Profile */}
      {candidate.roleType === 'pm' && candidate.pmProfile && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5 tracking-tight">
            <TrendingUp size={15} className="text-stone-400" />
            Product Management Profile
          </h4>

          {aiSummary.productSummary && (
            <div className="p-4 bg-stone-50/80 border border-stone-100 rounded-2xl">
              <p className="text-sm text-stone-500 leading-relaxed">{aiSummary.productSummary}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-stone-50/80 border border-stone-100 rounded-2xl text-center">
              <p className="text-xs text-stone-400">Products Shipped</p>
              <p className="text-xl font-bold text-foreground tabular-nums">{candidate.pmProfile.productsShipped}</p>
            </div>
            <div className="p-4 bg-stone-50/80 border border-stone-100 rounded-2xl text-center">
              <p className="text-xs text-stone-400">Case Studies</p>
              <p className="text-xl font-bold text-foreground tabular-nums">{candidate.pmProfile.caseStudies.length}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-stone-400 mb-1.5">Impact Metrics</p>
            <div className="flex gap-1.5 flex-wrap">
              {candidate.pmProfile.impactMetrics.map(metric => (
                <Badge key={metric} variant="success">{metric}</Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-stone-400 mb-2">Case Studies</p>
            <div className="space-y-2">
              {candidate.pmProfile.caseStudies.map(cs => (
                <div key={cs.title} className="p-4 border border-stone-200/80 rounded-2xl hover:shadow-md hover:shadow-stone-100/50 transition-all duration-200">
                  <p className="text-sm font-semibold text-foreground mb-1">{cs.title}</p>
                  <p className="text-xs text-stone-400 mb-2">{cs.impact}</p>
                  <div className="flex gap-1 flex-wrap">
                    {cs.metrics.map(m => (
                      <span key={m} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg font-medium">
                        {m}
                      </span>
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
