import React, { useState, useEffect } from 'react';
import { Bell, Search, Menu, Clock, Moon } from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';
import { motion } from 'motion/react';

interface TopBarProps {
  userEmail: string;
  userName: string;
  onMenuClick?: () => void;
  activeTab?: string;
}

export function TopBar({ userEmail, userName, onMenuClick, activeTab = 'dashboard' }: TopBarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).toLowerCase();

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'analysis': return 'System Dynamics';
      case 'alerts': return 'Alerts';
      case 'settings': return 'Settings';
      default: return 'Dashboard';
    }
  };

  const getPageSubtitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Analytics';
      case 'analysis': return 'Telemetry';
      case 'alerts': return 'Monitor';
      case 'settings': return 'Configuration';
      default: return 'Overview';
    }
  };

  return (
    <div className="h-14 sm:h-16 md:h-[72px] bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 sm:px-4 md:px-8 sticky top-0 z-40 transition-all duration-300">

      {/* Left: Hamburger + Title */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        <button
          className="hidden lg:flex items-center justify-center text-slate-500 dark:text-slate-400 p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <p className="text-[8px] sm:text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-0.5 sm:mb-1 flex items-center gap-1.5">
            Overview <span className="text-slate-300 hidden sm:inline">•</span> <span className="hidden sm:inline">v2.4.0</span>
          </p>
          <div className="flex items-center gap-1.5 sm:gap-3">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-none">
              {getPageTitle()}
            </h2>
            <div className="h-3 sm:h-4 w-[1.5px] bg-slate-200 dark:bg-slate-700 hidden sm:block" />
            <span className="text-slate-400 dark:text-slate-500 font-medium text-sm md:text-lg leading-none hidden sm:inline">
              {getPageSubtitle()}
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Search — hidden on mobile */}
      <div className="flex-1 max-w-xl mx-4 md:mx-8 hidden md:block relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search size={15} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Search data, reports, alerts..."
          className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-white dark:bg-slate-900/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium placeholder:text-slate-400 shadow-sm"
        />
      </div>

      {/* Right: Actions + Profile */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">

        {/* Time — hidden below xl */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="hidden xl:flex items-center gap-2 text-blue-500 font-medium bg-blue-50 dark:bg-blue-900/20 px-3.5 py-2 rounded-full border border-blue-100 dark:border-blue-800/30"
        >
          <Clock size={13} className="text-blue-500" />
          <span className="text-[10px] tracking-wide text-blue-600 dark:text-blue-400 tabular-nums">
            {formattedDate} <span className="mx-0.5 text-blue-300">•</span> {formattedTime}
          </span>
        </motion.div>

        {/* Action Icons */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 sm:p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
          >
            <Moon className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            className="relative p-2 sm:p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
          >
            <Bell className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" />
            <span className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-blue-500 rounded-full border-[1.5px] border-white dark:border-slate-900" />
          </motion.button>
        </div>

        {/* Divider */}
        <div className="hidden md:block h-8 w-px bg-slate-200 dark:bg-slate-800" />

        {/* User Profile — Premium Animated */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
        >
          {/* User Info - hidden on small screens */}
          <div className="hidden md:flex flex-col items-end justify-center">
            <p className="text-[10.5px] sm:text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate max-w-[140px]">
              {userName}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="relative flex h-[6px] w-[6px]">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-[6px] w-[6px] bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
              </div>
              <p className="text-[9px] sm:text-[10px] text-emerald-500 font-semibold tracking-wider uppercase">Online</p>
            </div>
          </div>

          {/* Avatar Area */}
          <motion.div
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <UserButton appearance={{ elements: { avatarBox: "w-[30px] h-[30px] sm:w-[34px] sm:h-[34px] md:w-[38px] md:h-[38px] rounded-full" } }} />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
