import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';

interface TopBarProps {
  userEmail: string;
  userName: string;
  onMenuClick?: () => void;
}

export function TopBar({ userEmail, userName, onMenuClick }: TopBarProps) {
  const date = new Date();
  const formattedDate = date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40 transition-colors duration-300">
      <div className="flex items-center gap-4">
        <button className="lg:hidden text-slate-500 dark:text-slate-400" onClick={onMenuClick}>
          <Menu size={24} />
        </button>
        <div>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Welcome back, <span className="text-blue-600 dark:text-blue-400">{userName}</span>
          </h2>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:block">
            {formattedDate} • {formattedTime}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={14} className="text-slate-400 dark:text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-slate-200 transition-colors"
          />
        </div>

        <button className="relative p-2 text-slate-400 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>

        <div className="flex items-center gap-2 pl-4 border-l border-slate-100 dark:border-slate-800">
          <UserButton />
          <div className="hidden md:block text-right">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{userName}</p>
            <div className="flex items-center justify-end gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Online</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
