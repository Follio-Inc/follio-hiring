'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Sparkles, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/app-context';
import { RoleType, ExperienceLevel } from '@/lib/types';

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

  const addTag = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    list: string[],
    listSetter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const trimmed = value.trim();
    if (trimmed && !list.includes(trimmed)) {
      listSetter([...list, trimmed]);
      setter('');
    }
  };

  const removeTag = (
    value: string,
    list: string[],
    listSetter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    listSetter(list.filter(t => t !== value));
  };

  const handleAIEnhance = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1200));

    if (!description && title) {
      setDescription(
        `We are looking for a talented ${experienceLevel} ${roleType === 'pm' ? 'Product Manager' : roleType === 'designer' ? 'Designer' : 'Engineer'} to join our ${department || 'team'}. The ideal candidate will have strong experience in ${requiredSkills.slice(0, 3).join(', ') || 'relevant technologies'} and a passion for building great products.`
      );
    }

    if (requiredSkills.length === 0 && roleType === 'developer') {
      setRequiredSkills(['React', 'TypeScript', 'Node.js']);
    }
    if (requiredSkills.length === 0 && roleType === 'designer') {
      setRequiredSkills(['Figma', 'UI Design', 'User Research']);
    }
    if (requiredSkills.length === 0 && roleType === 'pm') {
      setRequiredSkills(['Product Strategy', 'Data Analysis', 'User Research']);
    }

    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addJob({
      title: title.trim(),
      department: department.trim() || 'General',
      roleType,
      requiredSkills,
      experienceLevel,
      description: description.trim(),
      mustHave,
      niceToHave,
      status: 'active',
    });

    router.push('/dashboard');
  };

  const inputClasses = 'w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white';

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <div className="space-y-6">
        {/* Title & Department */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Job Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              className={inputClasses}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Department</label>
            <input
              type="text"
              value={department}
              onChange={e => setDepartment(e.target.value)}
              placeholder="e.g. Engineering"
              className={inputClasses}
            />
          </div>
        </div>

        {/* Role Type & Experience */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Role Type</label>
            <select
              value={roleType}
              onChange={e => setRoleType(e.target.value as RoleType)}
              className={inputClasses}
            >
              <option value="developer">Developer</option>
              <option value="designer">Designer</option>
              <option value="pm">Product Manager</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Experience Level</label>
            <select
              value={experienceLevel}
              onChange={e => setExperienceLevel(e.target.value as ExperienceLevel)}
              className={inputClasses}
            >
              <option value="junior">Junior</option>
              <option value="mid">Mid-level</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
              <option value="principal">Principal</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-foreground">Job Description</label>
            <button
              type="button"
              onClick={handleAIEnhance}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700 disabled:opacity-50"
            >
              <Sparkles size={13} />
              {isGenerating ? 'Generating...' : 'AI Enhance'}
            </button>
          </div>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe the role, responsibilities, and what you're looking for..."
            rows={4}
            className={`${inputClasses} resize-none`}
          />
        </div>

        {/* Required Skills */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Required Skills</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {requiredSkills.map(skill => (
              <span key={skill} className="inline-flex items-center gap-1 px-2 py-1 bg-violet-50 text-violet-700 rounded-md text-xs font-medium">
                {skill}
                <button type="button" onClick={() => removeTag(skill, requiredSkills, setRequiredSkills)} className="hover:text-violet-900">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag(skillInput, setSkillInput, requiredSkills, setRequiredSkills);
                }
              }}
              placeholder="Type a skill and press Enter"
              className={`flex-1 ${inputClasses}`}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => addTag(skillInput, setSkillInput, requiredSkills, setRequiredSkills)}
            >
              <Plus size={14} />
            </Button>
          </div>
        </div>

        {/* Must-Have */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Must-Have Criteria</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {mustHave.map(item => (
              <span key={item} className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium">
                {item}
                <button type="button" onClick={() => removeTag(item, mustHave, setMustHave)} className="hover:text-emerald-900">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={mustHaveInput}
              onChange={e => setMustHaveInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag(mustHaveInput, setMustHaveInput, mustHave, setMustHave);
                }
              }}
              placeholder="e.g. 5+ years React experience"
              className={`flex-1 ${inputClasses}`}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => addTag(mustHaveInput, setMustHaveInput, mustHave, setMustHave)}
            >
              <Plus size={14} />
            </Button>
          </div>
        </div>

        {/* Nice-to-Have */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Nice-to-Have</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {niceToHave.map(item => (
              <span key={item} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                {item}
                <button type="button" onClick={() => removeTag(item, niceToHave, setNiceToHave)} className="hover:text-gray-800">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={niceToHaveInput}
              onChange={e => setNiceToHaveInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag(niceToHaveInput, setNiceToHaveInput, niceToHave, setNiceToHave);
                }
              }}
              placeholder="e.g. GraphQL experience"
              className={`flex-1 ${inputClasses}`}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => addTag(niceToHaveInput, setNiceToHaveInput, niceToHave, setNiceToHave)}
            >
              <Plus size={14} />
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <Button type="submit" disabled={!title.trim()}>
            <Briefcase size={16} className="mr-2" />
            Create Job
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}
