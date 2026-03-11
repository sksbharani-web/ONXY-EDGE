import React, { useState } from 'react';
import { LayoutDashboard, Settings, LogOut, Bell, ChevronRight, PieChart } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  userEmail: string;
  userName: string;
}

export function Sidebar({ activeTab, onTabChange, onLogout, userEmail, userName }: SidebarProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Get user initials for avatar fallback
  const initials = userName
    ? userName.substring(0, 2).toUpperCase()
    : 'VG';

  return (
    <>
      <div className="h-screen w-64 bg-[#0f172a] text-white flex flex-col fixed left-0 top-0 z-50">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="relative">
            <Logo className="w-10 h-10 drop-shadow-xl" />
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0f172a] animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">ONXY EDGE</h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider">IoT Energy Monitor</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 py-6 space-y-2">
          <SidebarItem
            icon={LayoutDashboard}
            label="Dashboard"
            active={activeTab === 'dashboard'}
            onClick={() => onTabChange('dashboard')}
          />
          <SidebarItem
            icon={PieChart}
            label="Analysis"
            active={activeTab === 'analysis'}
            onClick={() => onTabChange('analysis')}
          />
          <SidebarItem
            icon={Bell}
            label="Alerts"
            active={activeTab === 'alerts'}
            onClick={() => onTabChange('alerts')}
          />
          <SidebarItem
            icon={Settings}
            label="Settings"
            active={activeTab === 'settings'}
            onClick={() => onTabChange('settings')}
          />
        </div>

        {/* User Profile + Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          {/* User info */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {initials}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{userName}</p>
              <p className="text-[10px] text-slate-500 truncate">
                {userEmail ? 'Authenticated' : 'Guest Mode'}
              </p>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all group"
          >
            <LogOut size={16} className="group-hover:text-rose-400 transition-colors" />
            <span>Sign Out</span>
            <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                <LogOut className="w-7 h-7 text-rose-400" />
              </div>
            </div>

            {/* Text */}
            <h3 className="text-lg font-bold text-white text-center mb-2">Sign Out?</h3>
            <p className="text-sm text-slate-400 text-center mb-6 leading-relaxed">
              You'll be signed out of your ONXY EDGE account. Your device will continue monitoring in the background.
            </p>

            {/* User being logged out */}
            {userEmail && (
              <div className="bg-slate-800/50 rounded-xl p-3 mb-5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                  {initials}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-medium text-slate-300 truncate">{userEmail}</p>
                  <p className="text-[10px] text-slate-500">Currently signed in</p>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={cancelLogout}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-colors shadow-lg shadow-rose-500/20"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SidebarItem({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
      )}
    >
      <Icon size={18} />
      {label}
      {active && <div className="ml-auto w-1 h-4 bg-white/20 rounded-full" />}
    </button>
  );
}
