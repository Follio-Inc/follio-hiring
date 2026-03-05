'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Sparkles, Briefcase, Code, Palette, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/app-context';
import { RoleType, ExperienceLevel } from '@/lib/types';

const ROLE_ICONS: Record<RoleType, React.ReactNode> = {
  developer: <Code size={18} />,
  designer: <Palette size={18} />,
  pm: <BarChart3 size={18} />,
  custom: <Briefcase size={18} />,
};

export function JobCreationForm() {
  const router = useRouter();
  const { addJob } = useApp();

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [roleType, setRoleType] = useState<RoleType>('developer');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('mid');
  const [description, setDescription] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [mustHaveInput, setMustHaveInput] = useState('');
  const [mustHave, setMustHave] = useState<string[]>([]);
  const [niceToHaveInput, setNiceToHaveInput] = useState('');
  const [niceToHave, setNiceToHave] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const addTag = (value: string, setter: React.Dispatch<React.SetStateAction<string>>, list: string[], listSetter: React.Dispatch<React.SetStateAction<string[]>>) => {
    const trimmed = value.trim();
    if (trimmed && !list.includes(trimmed)) { listSetter([...list, trimmed]); setter(''); }
  };

  const removeTag = (value: string, list: string[], listSetter: React.Dispatch<React.SetStateAction<string[]>>) => {
    listSetter(list.filter(t => t !== value));
  };

  const handleAIEnhance = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    if (!description && title) {
      setDescription(`We are looking for a talented ${experienceLevel} ${roleType === 'pm' ? 'Product Manager' : roleType === 'designer' ? 'Designer' : 'Engineer'} to join our ${department || 'team'}. The ideal candidate will have strong experience in ${requiredSkills.slice(0, 3).join(', ') || 'relevant technologies'} and a passion for building great products.`);
    }
    if (requiredSkills.length === 0 && roleType === 'developer') setRequiredSkills(['React', 'TypeScript', 'Node.js']);
    if (requiredSkills.length === 0 && roleType === 'designer') setRequiredSkills(['Figma', 'UI Design', 'User Research']);
    if (requiredSkills.length === 0 && roleType === 'pm') setRequiredSkills(['Product Strategy', 'Data Analysis', 'User Research']);
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addJob({ title: title.trim(), department: department.trim() || 'General', roleType, requiredSkills, experienceLevel, description: description.trim(), mustHave, niceToHave, status: 'active' });
    router.push('/hiring/dashboard');
  };

  const inputClasses = 'w-full px-4 py-3 text-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 bg-white/50 backdrop-blur-sm transition-all placeholder:text-stone-400';

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <div className="mb-8">
        <label className="block text-sm font-semibold text-foreground mb-3">What role are you hiring for?</label>
        <div className="grid grid-cols-4 gap-3">
          {(['developer', 'designer', 'pm', 'custom'] as RoleType[]).map(type => (
            <button key={type} type="button" onClick={() => setRoleType(type)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 backdrop-blur-sm transition-all duration-200 ${
                roleType === type
                  ? 'border-amber-500 bg-amber-50/50 text-amber-700 shadow-lg shadow-amber-200/20'
                  : 'border-white/50 bg-white/30 text-stone-500 hover:border-white/80 hover:bg-white/50'
              }`}>
              {ROLE_ICONS[type]}
              <span className="text-xs font-semibold capitalize">{type === 'pm' ? 'Product Manager' : type}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-2xl p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Job Title *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Senior Frontend Engineer" className={inputClasses} required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Department</label>
            <input type="text" value={department} onChange={e => setDepartment(e.target.value)} placeholder="e.g. Engineering" className={inputClasses} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Experience Level</label>
          <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value as ExperienceLevel)} className={inputClasses}>
            <option value="junior">Junior</option>
            <option value="mid">Mid-level</option>
            <option value="senior">Senior</option>
            <option value="lead">Lead</option>
            <option value="principal">Principal</option>
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-foreground">Job Description</label>
            <button type="button" onClick={handleAIEnhance} disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50/60 hover:bg-amber-100/60 backdrop-blur-sm rounded-lg transition-all duration-200 disabled:opacity-50">
              <Sparkles size={13} className={isGenerating ? 'animate-spin' : ''} />
              {isGenerating ? 'Generating...' : 'AI Enhance'}
            </button>
          </div>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the role, responsibilities, and what you're looking for..." rows={4} className={`${inputClasses} resize-none`} />
        </div>
      </div>

      <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-2xl p-6 space-y-6 mt-4">
        <h3 className="text-sm font-bold text-foreground tracking-tight">Requirements</h3>

        {[
          { label: 'Required Skills', input: skillInput, setInput: setSkillInput, list: requiredSkills, setList: setRequiredSkills, tagColor: 'bg-amber-50/60 text-amber-700', placeholder: 'Type a skill and press Enter' },
          { label: 'Must-Have Criteria', input: mustHaveInput, setInput: setMustHaveInput, list: mustHave, setList: setMustHave, tagColor: 'bg-emerald-50/60 text-emerald-700', placeholder: 'e.g. 5+ years React experience' },
          { label: 'Nice-to-Have', input: niceToHaveInput, setInput: setNiceToHaveInput, list: niceToHave, setList: setNiceToHave, tagColor: 'bg-white/50 text-stone-600', placeholder: 'e.g. GraphQL experience' },
        ].map(section => (
          <div key={section.label}>
            <label className="block text-sm font-semibold text-foreground mb-2">{section.label}</label>
            {section.list.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {section.list.map(item => (
                  <span key={item} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm ${section.tagColor}`}>
                    {item}
                    <button type="button" onClick={() => removeTag(item, section.list, section.setList)} className="hover:opacity-70 transition-opacity"><X size={12} /></button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input type="text" value={section.input} onChange={e => section.setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(section.input, section.setInput, section.list, section.setList); } }}
                placeholder={section.placeholder} className={`flex-1 ${inputClasses}`} />
              <Button type="button" variant="secondary" size="sm" className="!rounded-xl !px-3"
                onClick={() => addTag(section.input, section.setInput, section.list, section.setList)}>
                <Plus size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-6">
        <Button type="submit" disabled={!title.trim()} className="!px-6">
          <Briefcase size={16} className="mr-2" /> Create Job
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
