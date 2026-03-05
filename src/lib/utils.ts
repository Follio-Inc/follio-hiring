import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatRelativeDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatFullDate(dateStr);
}

export function formatFullDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatSalary(min?: number, max?: number, currency = 'USD') {
  if (!min && !max) return null;
  const fmt = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  });
  if (min && max) return `${fmt.format(min)} – ${fmt.format(max)}`;
  if (min) return `From ${fmt.format(min)}`;
  return `Up to ${fmt.format(max!)}`;
}

export function getFitScoreColor(score: number): string {
  if (score >= 85) return 'text-emerald-600';
  if (score >= 70) return 'text-violet-600';
  if (score >= 50) return 'text-amber-600';
  return 'text-red-500';
}

export function getFitScoreBg(score: number): string {
  if (score >= 85) return 'bg-emerald-50 border-emerald-200';
  if (score >= 70) return 'bg-violet-50 border-violet-200';
  if (score >= 50) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
}

export function fitScoreColor(score: number) {
  if (score >= 75) return 'text-emerald-600';
  if (score >= 50) return 'text-amber-600';
  return 'text-stone-400';
}

export function fitScoreRingColor(score: number) {
  if (score >= 75) return 'stroke-emerald-500';
  if (score >= 50) return 'stroke-amber-500';
  return 'stroke-stone-300';
}

export function fitScoreBgColor(score: number) {
  if (score >= 75) return 'bg-emerald-50';
  if (score >= 50) return 'bg-amber-50';
  return 'bg-stone-50';
}

export function getRoleIcon(roleType: string): string {
  switch (roleType) {
    case 'developer':
    case 'engineering':
      return '💻';
    case 'designer':
    case 'design':
      return '🎨';
    case 'pm':
    case 'product':
      return '📊';
    case 'data':
      return '📈';
    case 'devops':
      return '⚙️';
    default:
      return '👤';
  }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function stageLabel(stage: string) {
  const labels: Record<string, string> = {
    new: 'New',
    applied: 'Applied',
    reviewing: 'Reviewing',
    shortlisted: 'Shortlisted',
    interview: 'Interview',
    offer: 'Offer',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
  };
  return labels[stage] ?? stage;
}

export function stageColor(stage: string) {
  const colors: Record<string, string> = {
    new: 'bg-violet-100 text-violet-700',
    applied: 'bg-blue-100 text-blue-700',
    reviewing: 'bg-amber-100 text-amber-700',
    shortlisted: 'bg-purple-100 text-purple-700',
    interview: 'bg-emerald-100 text-emerald-700',
    offer: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    withdrawn: 'bg-stone-100 text-stone-500',
  };
  return colors[stage] ?? 'bg-stone-100 text-stone-600';
}
