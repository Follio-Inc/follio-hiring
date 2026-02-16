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
  const { candidate, aiSummary } = application;

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
      <div className="relative w-full max-w-2xl bg-white shadow-2xl overflow-y-auto animate-slide-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <Avatar name={candidate.name} size="lg" />
              <div>
                <h2 className="text-lg font-semibold text-foreground">{candidate.name}</h2>
                <p className="text-sm text-muted-foreground">{candidate.title} · {candidate.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FitScore score={application.fitScore} size="md" showLabel />
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 text-muted-foreground hover:text-foreground transition-colors"
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
              className="px-2.5 py-1.5 text-xs font-medium border border-border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-violet-500"
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
          <div className="px-6 flex gap-4 border-t border-border">
            {(['overview', 'profile', 'notes'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'py-2.5 text-sm font-medium border-b-2 transition-colors capitalize',
                  activeTab === tab
                    ? 'border-violet-600 text-violet-600'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {tab}
                {tab === 'notes' && application.notes.length > 0 && (
                  <span className="ml-1.5 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
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
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <Button size="md" onClick={handleAddNote} disabled={!noteInput.trim()}>
                  <Send size={14} />
                </Button>
              </div>

              {/* Notes list */}
              {application.notes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No notes yet. Add the first one.</p>
              ) : (
                <div className="space-y-3">
                  {[...application.notes].reverse().map(note => (
                    <div key={note.id} className="p-3 bg-muted/50 rounded-2xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{note.authorName}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{note.content}</p>
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
      <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-violet-600" />
          <h3 className="text-sm font-semibold text-violet-900">AI Assessment</h3>
        </div>
        <p className="text-sm text-violet-800 leading-relaxed">{aiSummary.summary}</p>
      </div>

      {/* Fit Score Bar */}
      <FitScoreBar score={fitScore} />

      {/* Key Info */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-muted/50 rounded-2xl text-center">
          <p className="text-xs text-muted-foreground mb-0.5">Experience</p>
          <p className="text-lg font-bold text-foreground">{candidate.yearsOfExperience}yr</p>
        </div>
        <div className="p-3 bg-muted/50 rounded-2xl text-center">
          <p className="text-xs text-muted-foreground mb-0.5">Role</p>
          <p className="text-lg font-bold text-foreground">{getRoleIcon(candidate.roleType)}</p>
        </div>
        <div className="p-3 bg-muted/50 rounded-2xl text-center">
          <p className="text-xs text-muted-foreground mb-0.5">Skills Match</p>
          <p className="text-lg font-bold text-foreground">{candidate.skills.length}</p>
        </div>
      </div>

      {/* Skills */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-2">Skills</h4>
        <div className="flex flex-wrap gap-1.5">
          {candidate.skills.map(skill => (
            <Badge key={skill} variant="info" size="sm">{skill}</Badge>
          ))}
        </div>
      </div>

      {/* Strengths */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
          <CheckCircle2 size={15} className="text-emerald-500" />
          Strengths
        </h4>
        <ul className="space-y-1.5">
          {aiSummary.strengths.map((s, i) => (
            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
              {s}
            </li>
          ))}
        </ul>
      </div>

      {/* Risks */}
      {aiSummary.risks.length > 0 && aiSummary.risks[0] !== 'No significant risks identified' && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
            <AlertTriangle size={15} className="text-amber-500" />
            Risk Flags
          </h4>
          <ul className="space-y-1.5">
            {aiSummary.risks.map((r, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Interview Focus */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
          <Target size={15} className="text-violet-500" />
          Interview Focus Areas
        </h4>
        <ul className="space-y-1.5">
          {aiSummary.interviewFocusAreas.map((area, i) => (
            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
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
        <h4 className="text-sm font-medium text-foreground mb-2">About</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{candidate.bio}</p>
        {candidate.portfolioUrl && (
          <a
            href={candidate.portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 mt-2"
          >
            View Portfolio <ExternalLink size={13} />
          </a>
        )}
      </div>

      {/* Developer Profile */}
      {candidate.roleType === 'developer' && candidate.github && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <GitBranch size={15} className="text-muted-foreground" />
            GitHub Profile
          </h4>

          {aiSummary.technicalSummary && (
            <div className="p-3 bg-muted/50 border border-border rounded-2xl">
              <p className="text-sm text-muted-foreground">{aiSummary.technicalSummary}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-muted/50 rounded-2xl text-center">
              <p className="text-xs text-muted-foreground">Repos</p>
              <p className="text-lg font-bold text-foreground">{candidate.github.repos}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-2xl text-center">
              <p className="text-xs text-muted-foreground">Stars</p>
              <p className="text-lg font-bold text-foreground">{candidate.github.stars}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-2xl text-center">
              <p className="text-xs text-muted-foreground">Contributions</p>
              <p className="text-lg font-bold text-foreground">{candidate.github.contributions}</p>
            </div>
          </div>

          {/* Languages */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Top Languages</p>
            <div className="flex gap-1.5">
              {candidate.github.topLanguages.map(lang => (
                <Badge key={lang} variant="neutral">{lang}</Badge>
              ))}
            </div>
          </div>

          {/* Top Projects */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Top Projects</p>
            <div className="space-y-2">
              {candidate.github.topProjects.map(project => (
                <div key={project.name} className="p-3 border border-border rounded-2xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{project.name}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star size={12} className="text-amber-400" fill="currentColor" />
                      {project.stars}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{project.description}</p>
                  <Badge variant="neutral" size="sm" className="mt-1.5">{project.language}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Graph */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">12-Month Activity</p>
            <div className="flex items-end gap-1 h-16">
              {candidate.github.activityData.map((value, i) => {
                const maxVal = Math.max(...candidate.github!.activityData);
                const height = (value / maxVal) * 100;
                return (
                  <div
                    key={i}
                    className="flex-1 bg-violet-400 rounded-t opacity-70 hover:opacity-100 transition-opacity"
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
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Palette size={15} className="text-muted-foreground" />
            Design Portfolio
          </h4>

          {aiSummary.designSummary && (
            <div className="p-3 bg-muted/50 border border-border rounded-2xl">
              <p className="text-sm text-muted-foreground">{aiSummary.designSummary}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted/50 rounded-2xl text-center">
              <p className="text-xs text-muted-foreground">Projects</p>
              <p className="text-lg font-bold text-foreground">{candidate.designPortfolio.projectCount}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-2xl text-center">
              <p className="text-xs text-muted-foreground">Visual Quality</p>
              <p className="text-lg font-bold text-foreground">{candidate.designPortfolio.visualQualityScore}/100</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Design Tools</p>
            <div className="flex gap-1.5 flex-wrap">
              {candidate.designPortfolio.tools.map(tool => (
                <Badge key={tool} variant="neutral">{tool}</Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Featured Projects</p>
            <div className="grid grid-cols-2 gap-2">
              {candidate.designPortfolio.featuredProjects.map(project => (
                <div key={project.title} className="border border-border rounded-2xl overflow-hidden">
                  <div className="h-24 bg-gradient-to-br from-violet-50 to-purple-100 flex items-center justify-center">
                    <Palette size={24} className="text-violet-300" />
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium text-foreground">{project.title}</p>
                    <p className="text-xs text-muted-foreground">{project.category}</p>
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
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <TrendingUp size={15} className="text-muted-foreground" />
            Product Management Profile
          </h4>

          {aiSummary.productSummary && (
            <div className="p-3 bg-muted/50 border border-border rounded-2xl">
              <p className="text-sm text-muted-foreground">{aiSummary.productSummary}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted/50 rounded-2xl text-center">
              <p className="text-xs text-muted-foreground">Products Shipped</p>
              <p className="text-lg font-bold text-foreground">{candidate.pmProfile.productsShipped}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-2xl text-center">
              <p className="text-xs text-muted-foreground">Case Studies</p>
              <p className="text-lg font-bold text-foreground">{candidate.pmProfile.caseStudies.length}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Impact Metrics</p>
            <div className="flex gap-1.5 flex-wrap">
              {candidate.pmProfile.impactMetrics.map(metric => (
                <Badge key={metric} variant="success">{metric}</Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Case Studies</p>
            <div className="space-y-2">
              {candidate.pmProfile.caseStudies.map(cs => (
                <div key={cs.title} className="p-3 border border-border rounded-2xl">
                  <p className="text-sm font-medium text-foreground mb-1">{cs.title}</p>
                  <p className="text-xs text-muted-foreground mb-2">{cs.impact}</p>
                  <div className="flex gap-1 flex-wrap">
                    {cs.metrics.map(m => (
                      <span key={m} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
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
