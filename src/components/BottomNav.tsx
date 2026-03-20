import React from 'react';
import { LayoutDashboard, Activity, Bell, Settings, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface BottomNavProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    onMenuClick: () => void;
}

const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'analysis', icon: Activity, label: 'Dynamics' },
    { id: 'alerts', icon: Bell, label: 'Alerts' },
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'menu', icon: Menu, label: 'More' },
];

export function BottomNav({ activeTab, onTabChange, onMenuClick }: BottomNavProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
            {/* Frosted glass bar */}
            <div className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-2xl border-t border-slate-200/60 dark:border-slate-800/60 px-1 pt-1.5 pb-[env(safe-area-inset-bottom,8px)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
                <div className="flex items-center justify-around max-w-md mx-auto">
                    {navItems.map((item) => {
                        const isActive = item.id === 'menu' ? false : activeTab === item.id;
                        const isMenu = item.id === 'menu';

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (isMenu) {
                                        onMenuClick();
                                    } else {
                                        onTabChange(item.id);
                                    }
                                }}
                                className={cn(
                                    "relative flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-2xl transition-all duration-200 active:scale-90 min-w-[56px]",
                                    isActive && "text-blue-600 dark:text-blue-400",
                                    !isActive && !isMenu && "text-slate-400 dark:text-slate-500",
                                    isMenu && "text-slate-400 dark:text-slate-500"
                                )}
                            >
                                {/* Active indicator dot */}
                                {isActive && (
                                    <motion.div
                                        layoutId="bottomNavIndicator"
                                        className="absolute -top-1 w-5 h-[3px] rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                    />
                                )}

                                <div className={cn(
                                    "relative flex items-center justify-center w-7 h-7 rounded-xl transition-all duration-200",
                                    isActive && "bg-blue-50 dark:bg-blue-500/15"
                                )}>
                                    <item.icon className={cn(
                                        "transition-all duration-200",
                                        isActive ? "w-[19px] h-[19px]" : "w-[18px] h-[18px]"
                                    )} />

                                    {/* Alert badge for Alerts tab */}
                                    {item.id === 'alerts' && (
                                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full border-[1.5px] border-white dark:border-slate-900" />
                                    )}
                                </div>

                                <span className={cn(
                                    "text-[9px] font-semibold tracking-wide leading-none transition-all duration-200",
                                    isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"
                                )}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
