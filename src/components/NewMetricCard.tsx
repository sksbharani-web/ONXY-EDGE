import React, { useEffect, useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface NewMetricCardProps {
  label: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  color: string; // Tailwind text color class like 'text-blue-500'
  bgColor: string; // Tailwind bg color class like 'bg-blue-50'
  trend?: 'up' | 'down' | 'stable';
  subValue?: string;
  progress?: number;
  isCritical?: boolean;
}

export function NewMetricCard({ label, value, unit, icon: Icon, color, bgColor, trend, subValue, progress, isCritical }: NewMetricCardProps) {
  // Extract the base color name (e.g., 'blue' from 'text-blue-500') to create gradients
  const colorName = color.split('-')[1];
  const [isUpdating, setIsUpdating] = useState(false);

  // Trigger update animation when value changes
  useEffect(() => {
    setIsUpdating(true);
    const timer = setTimeout(() => setIsUpdating(false), 300);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "bg-white dark:bg-slate-900/40 p-5 rounded-[20px] border shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 relative overflow-hidden group cursor-default backdrop-blur-xl",
        isCritical ? "border-red-200 dark:border-red-900/50" : "border-slate-100/80 dark:border-slate-800/60"
      )}
    >
      {/* Critical Alert Glow Background */}
      {isCritical && (
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-red-500/5 dark:bg-red-500/10 pointer-events-none"
        />
      )}

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</p>
          <div className="flex items-baseline gap-1">
            <motion.h3
              animate={isUpdating ? { scale: 1.05, color: isCritical ? '#ef4444' : undefined } : { scale: 1 }}
              transition={{ duration: 0.2 }}
              className={cn("text-2xl font-bold tracking-tight", isCritical ? "text-red-500 dark:text-red-400" : color)}
            >
              {value}
            </motion.h3>
            <span className="text-sm text-slate-400 dark:text-slate-500 font-medium">{unit}</span>
          </div>
        </div>

        {/* Soft Animated Icon Container */}
        <div className="relative w-12 h-12 flex items-center justify-center">
          <motion.div
            initial="idle"
            animate={isCritical ? "critical" : "idle"}
            variants={{
              idle: {
                y: 0,
                transition: { duration: 0 }
              },
              critical: {
                scale: [1, 1.05, 1],
                transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
              }
            }}
            className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center relative",
              isCritical ? "bg-red-50 dark:bg-red-900/20" : bgColor
            )}
          >
            <Icon className={cn("w-5 h-5 transition-colors", isCritical ? "text-red-500 dark:text-red-400" : color)} />

            {/* Soft Update Pulse Ring */}
            <AnimatePresence>
              {isUpdating && !isCritical && (
                <motion.div
                  initial={{ opacity: 0.5, scale: 1 }}
                  animate={{ opacity: 0, scale: 1.8 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={cn("absolute inset-0 rounded-2xl border", color.replace('text-', 'border-'))}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {progress !== undefined && (
        <div className="w-full bg-slate-100/50 dark:bg-slate-800/50 h-1 rounded-full overflow-hidden mb-2 relative z-10">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${Math.min(100, Math.max(0, progress))}%`,
              backgroundColor: isCritical ? '#ef4444' : undefined
            }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className={cn("h-full rounded-full relative", !isCritical && color.replace('text-', 'bg-'))}
          />
        </div>
      )}

      {subValue && (
        <p className="text-xs text-slate-400 dark:text-slate-500 relative z-10">{subValue}</p>
      )}
    </motion.div>
  );
}
