'use client';

import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Application } from '@/lib/types';
import { Avatar } from '@/components/ui/avatar';
import { FitScore } from '@/components/ui/fit-score';
import { StageBadge } from '@/components/ui/stage-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { generateComparisonInsight } from '@/lib/ai-scoring';
import { useApp } from '@/contexts/app-context';

interface ComparisonViewProps {
  applications: Application[];
  jobId: string;
  onClose: () => void;
}

export function ComparisonView({ applications, jobId, onClose }: ComparisonViewProps) {
  const { clearCompare, moveStage } = useApp();
  const job = useApp().jobs.find(j => j.id === jobId);

  if (applications.length < 2 || !job) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Select at least 2 candidates to compare.</p>
      </div>
    );
  }

  const insight = generateComparisonInsight(
    applications.map(a => a.candidate),
    job,
    applications.map(a => a.fitScore)
  );

  const dimensions = [
    {
      label: 'Fit Score',
      values: applications.map(a => ({
        value: a.fitScore,
        display: a.fitScore.toString(),
        isBest: a.fitScore === Math.max(...applications.map(x => x.fitScore)),
      })),
    },
    {
      label: 'Experience',
      values: applications.map(a => ({
        value: a.candidate.yearsOfExperience,
        display: `${a.candidate.yearsOfExperience} years`,
        isBest: a.candidate.yearsOfExperience === Math.max(...applications.map(x => x.candidate.yearsOfExperience)),
      })),
    },
    {
      label: 'Skills Count',
      values: applications.map(a => ({
        value: a.candidate.skills.length,
        display: a.candidate.skills.length.toString(),
        isBest: a.candidate.skills.length === Math.max(...applications.map(x => x.candidate.skills.length)),
      })),
    },
    {
      label: 'Strengths',
      values: applications.map(a => ({
        value: a.aiSummary.strengths.length,
        display: a.aiSummary.strengths.length.toString(),
        isBest: false,
      })),
    },
    {
      label: 'Risk Flags',
      values: applications.map(a => {
        const hasRealRisks = a.aiSummary.risks.length > 0 && a.aiSummary.risks[0] !== 'No significant risks identified';
        return {
          value: hasRealRisks ? a.aiSummary.risks.length : 0,
          display: hasRealRisks ? a.aiSummary.risks.length.toString() : 'None',
          isBest: !hasRealRisks,
        };
      }),
    },
  ];

  return (
    <div className="space-y-6">
      {/* AI Insight */}
      <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-violet-600" />
          <h3 className="text-sm font-semibold text-violet-900">AI Comparison Insight</h3>
        </div>
        <p className="text-sm text-violet-800 leading-relaxed">{insight}</p>
      </div>

      {/* Candidate Headers */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${applications.length}, 1fr)` }}>
        <div /> {/* Spacer */}
        {applications.map(app => (
          <div key={app.id} className="text-center p-4 bg-card border border-border rounded-2xl">
            <div className="flex justify-center mb-2">
              <Avatar name={app.candidate.name} size="lg" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">{app.candidate.name}</h3>
            <p className="text-xs text-muted-foreground mb-2">{app.candidate.title}</p>
            <div className="flex justify-center mb-2">
              <FitScore score={app.fitScore} size="md" />
            </div>
            <StageBadge stage={app.stage} />
            <div className="mt-3 flex gap-1 justify-center">
              <Button
                size="sm"
                variant="success"
                onClick={() => moveStage(app.id, 'shortlisted')}
              >
                Shortlist
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {dimensions.map((dim, idx) => (
          <div
            key={dim.label}
            className={cn(
              'grid items-center py-3 px-4',
              idx !== dimensions.length - 1 && 'border-b border-border'
            )}
            style={{ gridTemplateColumns: `200px repeat(${applications.length}, 1fr)` }}
          >
            <span className="text-sm font-medium text-muted-foreground">{dim.label}</span>
            {dim.values.map((val, i) => (
              <div key={i} className="text-center">
                <span
                  className={cn(
                    'text-sm font-semibold',
                    val.isBest ? 'text-emerald-600' : 'text-foreground'
                  )}
                >
                  {val.display}
                  {val.isBest && <CheckCircle2 size={13} className="inline ml-1 text-emerald-500" />}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Skills Comparison */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <h4 className="text-sm font-semibold text-foreground mb-3">Skills Comparison</h4>
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${applications.length}, 1fr)` }}>
          {applications.map(app => (
            <div key={app.id}>
              <p className="text-xs font-medium text-muted-foreground mb-2">{app.candidate.name}</p>
              <div className="flex flex-wrap gap-1">
                {app.candidate.skills.map(skill => {
                  const isRequired = job.requiredSkills.some(rs =>
                    rs.toLowerCase().includes(skill.toLowerCase()) ||
                    skill.toLowerCase().includes(rs.toLowerCase())
                  );
                  return (
                    <Badge
                      key={skill}
                      variant={isRequired ? 'success' : 'neutral'}
                      size="sm"
                    >
                      {skill}
                    </Badge>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Risks */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${applications.length}, 1fr)` }}>
        {applications.map(app => (
          <div key={app.id} className="bg-card border border-border rounded-2xl p-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">{app.candidate.name}</p>

            <div className="mb-4">
              <h5 className="text-xs font-semibold text-emerald-700 flex items-center gap-1 mb-1.5">
                <CheckCircle2 size={12} /> Strengths
              </h5>
              <ul className="space-y-1">
                {app.aiSummary.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-semibold text-amber-700 flex items-center gap-1 mb-1.5">
                <AlertTriangle size={12} /> Risks
              </h5>
              <ul className="space-y-1">
                {app.aiSummary.risks.map((r, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-3 pt-4">
        <Button
          variant="ghost"
          onClick={() => {
            clearCompare();
            onClose();
          }}
        >
          Clear Comparison
        </Button>
      </div>
    </div>
  );
}
