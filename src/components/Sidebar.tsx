import React, { useState } from 'react';
import { LayoutDashboard, Settings, LogOut, Bell, ChevronRight, Activity, X } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  userEmail: string;
  userName: string;
  onOpenDeviceSettings: () => void;
  onOpenHardwareGuide: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ activeTab, onTabChange, onLogout, userEmail, userName, onOpenDeviceSettings, onOpenHardwareGuide, isMobileOpen = false, onMobileClose }: SidebarProps) {
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

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    // Auto-close sidebar on mobile after selecting a tab
    onMobileClose?.();
  };

  // Get user initials for avatar fallback
  const initials = userName
    ? userName.substring(0, 2).toUpperCase()
    : 'VG';

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onMobileClose}
        />
      )}

      <div className={cn(
        "h-screen w-64 bg-[#141b2d] text-slate-300 flex flex-col fixed left-0 top-0 z-50 shadow-2xl shadow-black/20 transition-transform duration-300 ease-in-out",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
          <div className="relative flex shrink-0 items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5">
            <div className="w-full h-full bg-[#141b2d] rounded-full flex items-center justify-center">
              <Logo className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#141b2d]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-base text-white tracking-widest">ONXY</h1>
              <span className="text-[9px] font-bold bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded tracking-widest">EDGE</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium tracking-wider mt-0.5">IOT ENERGY MONITOR</p>
          </div>
          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          <SidebarItem
            icon={LayoutDashboard}
            label="Dashboard"
            active={activeTab === 'dashboard'}
            onClick={() => handleTabChange('dashboard')}
          />
          <SidebarItem
            icon={Activity}
            label="System Dynamics"
            active={activeTab === 'analysis'}
            onClick={() => handleTabChange('analysis')}
          />

          <SidebarItem
            icon={Bell}
            label="Alerts & Notifications"
            active={activeTab === 'alerts'}
            onClick={() => handleTabChange('alerts')}
          />
          <SidebarItem
            icon={Settings}
            label="Settings"
            active={activeTab === 'settings'}
            onClick={() => handleTabChange('settings')}
          />
        </div>

        {/* User Profile + Logout */}
        <div className="p-4 border-t border-slate-800/50 space-y-3 bg-[#111827]">
          {/* User info */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-inner">
              {initials}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">@{userName.toUpperCase().replace(/\s+/g, '')}</p>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                {userEmail || 'guest@energyplus.ai'}
              </p>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all group"
          >
            <LogOut size={16} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
            <span>Sign Out</span>
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
        "relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
        active
          ? "bg-[#1e293b]/80 text-white shadow-sm"
          : "text-slate-400 hover:bg-[#1e293b]/40 hover:text-slate-200"
      )}
    >
      <Icon size={18} className={cn(active ? "text-blue-400" : "text-slate-500 group-hover:text-slate-400")} />
      {label}
      {active && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
      )}
    </button>
  );
}
