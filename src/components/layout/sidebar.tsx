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
    <aside className="w-64 h-screen bg-white border-r border-border flex flex-col fixed left-0 top-0 z-30">
      {/* Logo — matches Folio branding */}
      <div className="h-16 flex items-center px-5 border-b border-border">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Follio Logo"
            width={32}
            height={32}
            className="object-contain"
          />
          <span className="text-xl font-semibold bg-gradient-to-r from-violet-600 to-violet-400 bg-clip-text text-transparent">
            Follio
          </span>
          <span className="text-xs font-medium text-muted-foreground mt-0.5">Hire</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {navItems.map(item => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                item.active
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Jobs List */}
        <div className="mt-6">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Jobs
            </span>
            <button
              onClick={() => router.push('/jobs/new')}
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
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
                  'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors group',
                  pathname === `/jobs/${job.id}`
                    ? 'bg-violet-50 text-violet-700'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base flex-shrink-0">
                    {job.roleType === 'developer' ? '💻' : job.roleType === 'designer' ? '🎨' : job.roleType === 'pm' ? '📊' : '👤'}
                  </span>
                  <span className="truncate">{job.title}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">{job.applicantCount}</span>
                  <ChevronRight
                    size={14}
                    className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-border p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar name={user.name} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
