'use client';

import { Search, Bell } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="h-14 bg-[#faf9f6]/80 backdrop-blur-xl border-b border-stone-200/80 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-lg font-bold text-foreground tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs text-stone-400 -mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search candidates..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-64 pl-9 pr-3 py-1.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300 bg-white/60 placeholder-stone-400 transition-all"
          />
        </div>

        <button className="relative p-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-all duration-200">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-600 rounded-full ring-2 ring-[#faf9f6]" />
        </button>

        {actions}
      </div>
    </header>
  );
}
