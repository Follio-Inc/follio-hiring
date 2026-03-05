'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SkillTagInput } from '@/components/ui/skill-tag';
import { cn } from '@/lib/utils';
import { User, MapPin, Save } from 'lucide-react';

const experienceLevels = [
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid-level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
];

const roleTypes = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'design', label: 'Design' },
  { value: 'product', label: 'Product' },
  { value: 'data', label: 'Data' },
  { value: 'devops', label: 'DevOps' },
  { value: 'marketing', label: 'Marketing' },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, isLoading, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('mid');
  const [rolePreferences, setRolePreferences] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/profile');
    }
    if (profile) {
      setName(profile.name);
      setLocation(profile.location);
      setExperienceLevel(profile.experienceLevel);
      setRolePreferences(profile.rolePreferences);
      setSkills(profile.skills);
      setPortfolioUrl(profile.portfolioUrl || '');
      setGithubUrl(profile.githubUrl || '');
      setLinkedinUrl(profile.linkedinUrl || '');
    }
  }, [isLoading, user, profile, router]);

  const toggleRole = (role: string) => {
    setRolePreferences((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const handleSave = async () => {
    setSaving(true);
    updateProfile({
      name,
      location,
      experienceLevel,
      rolePreferences,
      skills,
      portfolioUrl: portfolioUrl || undefined,
      githubUrl: githubUrl || undefined,
      linkedinUrl: linkedinUrl || undefined,
    });
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (isLoading || !user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-stone-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-800">My Profile</h1>
        <p className="text-stone-500 mt-1">This information helps us find your best matches</p>
      </div>

      <div className="space-y-6">
        <GlassCard padding="lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-800">{name || user.name}</h2>
              <p className="text-sm text-stone-500">{user.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. San Francisco, CA" />
          </div>
        </GlassCard>

        <GlassCard padding="lg">
          <h3 className="text-lg font-semibold text-stone-800 mb-4">
            <MapPin className="w-5 h-5 inline mr-2" />Experience Level
          </h3>
          <div className="flex flex-wrap gap-2">
            {experienceLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => setExperienceLevel(level.value)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer',
                  experienceLevel === level.value
                    ? 'bg-amber-50 border-amber-300 text-amber-700'
                    : 'bg-white/30 border-white/40 text-stone-500 hover:bg-white/50',
                )}
              >
                {level.label}
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard padding="lg">
          <h3 className="text-lg font-semibold text-stone-800 mb-4">Role Preferences</h3>
          <div className="flex flex-wrap gap-2">
            {roleTypes.map((role) => (
              <button
                key={role.value}
                onClick={() => toggleRole(role.value)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer',
                  rolePreferences.includes(role.value)
                    ? 'bg-amber-50 border-amber-300 text-amber-700'
                    : 'bg-white/30 border-white/40 text-stone-500 hover:bg-white/50',
                )}
              >
                {role.label}
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard padding="lg">
          <SkillTagInput skills={skills} onChange={setSkills} label="Skills" />
        </GlassCard>

        <GlassCard padding="lg">
          <h3 className="text-lg font-semibold text-stone-800 mb-4">Links</h3>
          <div className="space-y-4">
            <Input label="Portfolio URL" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://yourportfolio.com" />
            <Input label="GitHub" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/username" />
            <Input label="LinkedIn" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/username" />
          </div>
        </GlassCard>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} isLoading={saving} size="lg">
            <Save className="w-4 h-4 mr-1.5" />
            Save profile
          </Button>
          {saved && <span className="text-sm text-emerald-600 font-medium animate-fade-in">Profile saved!</span>}
        </div>
      </div>
    </div>
  );
}
