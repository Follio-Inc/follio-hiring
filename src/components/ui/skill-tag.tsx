'use client';

import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { useState, type KeyboardEvent } from 'react';

interface SkillTagProps {
  label: string;
  removable?: boolean;
  onRemove?: () => void;
  variant?: 'default' | 'amber' | 'match' | 'gap';
  className?: string;
}

export function SkillTag({ label, removable, onRemove, variant = 'default', className }: SkillTagProps) {
  const variantClasses = {
    default: 'bg-stone-100 text-stone-600 border-stone-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    match: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    gap: 'bg-red-50 text-red-600 border-red-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border',
        variantClasses[variant],
        className,
      )}
    >
      {label}
      {removable && onRemove && (
        <button type="button" onClick={onRemove} className="ml-0.5 hover:opacity-70 transition-opacity" aria-label={`Remove ${label}`}>
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

interface SkillTagInputProps {
  skills: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
  label?: string;
  maxSkills?: number;
}

export function SkillTagInput({ skills, onChange, placeholder = 'Type a skill and press Enter', label, maxSkills = 20 }: SkillTagInputProps) {
  const [input, setInput] = useState('');

  const addSkill = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !skills.some((s) => s.toLowerCase() === trimmed.toLowerCase()) && skills.length < maxSkills) {
      onChange([...skills, trimmed]);
    }
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(input);
    }
    if (e.key === 'Backspace' && !input && skills.length > 0) {
      onChange(skills.slice(0, -1));
    }
  };

  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-stone-700">{label}</label>}
      <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/60 focus-within:ring-2 focus-within:ring-amber-500/30 focus-within:border-amber-500/50 transition-all duration-200 min-h-[44px]">
        {skills.map((skill) => (
          <SkillTag key={skill} label={skill} variant="amber" removable onRemove={() => onChange(skills.filter((s) => s !== skill))} />
        ))}
        {skills.length < maxSkills && (
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => addSkill(input)}
            placeholder={skills.length === 0 ? placeholder : 'Add more...'}
            className="flex-1 min-w-[120px] bg-transparent text-sm text-stone-800 placeholder:text-stone-400 outline-none"
          />
        )}
      </div>
      <p className="text-xs text-stone-400">
        {skills.length}/{maxSkills} skills · Press Enter or comma to add
      </p>
    </div>
  );
}
