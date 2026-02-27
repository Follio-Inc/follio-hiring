'use client';

import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  Briefcase,
  Plus,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/app-context';
import { useAuth } from '@/contexts/auth-context';
import { Avatar } from '@/components/ui/avatar';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { jobs, user } = useApp();
  const { logout } = useAuth();

  const activeJobs = jobs.filter(j => j.status === 'active');

  const navItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      active: pathname === '/dashboard',
    },
    {
      label: 'All Jobs',
      icon: Briefcase,
      href: '/jobs/all',
      active: pathname.startsWith('/jobs'),
    },
  ];

  return (
    <aside className="w-64 h-screen bg-white/40 backdrop-blur-2xl border-r border-white/50 flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-white/40">
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Together Logo"
            width={28}
            height={28}
            className="object-contain"
          />
          <span className="text-lg font-bold tracking-tight text-foreground">
            Together
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-5 px-3">
        <div className="space-y-1">
          {navItems.map(item => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                item.active
                  ? 'bg-amber-50/70 text-amber-800 shadow-sm shadow-amber-200/30 backdrop-blur-sm'
                  : 'text-stone-400 hover:bg-white/50 hover:text-stone-700'
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Jobs List */}
        <div className="mt-8">
          <div className="flex items-center justify-between px-3 mb-3">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest">
              Active Jobs
            </span>
            <button
              onClick={() => router.push('/jobs/new')}
              className="p-1 rounded-lg hover:bg-white/50 text-stone-400 hover:text-stone-600 transition-all duration-200"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="space-y-0.5">
            {activeJobs.map(job => (
              <button
                key={job.id}
                onClick={() => router.push(`/jobs/${job.id}`)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group',
                  pathname === `/jobs/${job.id}`
                    ? 'bg-amber-50/70 text-amber-800 shadow-sm shadow-amber-200/30 backdrop-blur-sm'
                    : 'text-stone-400 hover:bg-white/50 hover:text-stone-600'
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base flex-shrink-0">
                    {job.roleType === 'developer' ? '💻' : job.roleType === 'designer' ? '🎨' : job.roleType === 'pm' ? '📊' : '👤'}
                  </span>
                  <span className="truncate">{job.title}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-stone-400 tabular-nums">{job.applicantCount}</span>
                  <ChevronRight
                    size={14}
                    className="text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-white/40 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar name={user.name} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-stone-700 truncate">{user.name}</p>
              <p className="text-xs text-stone-400 truncate capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="p-1.5 rounded-lg hover:bg-white/50 text-stone-400 hover:text-stone-600 transition-all duration-200"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
