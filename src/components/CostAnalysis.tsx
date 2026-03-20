import React from 'react';
import { IndianRupee, TrendingUp, Calendar, Zap } from 'lucide-react';
import { EnergyReading, ELECTRICITY_RATE } from '@/types';

interface CostAnalysisProps {
  history: EnergyReading[];
  currentPower: number;  // current power in watts
}

export function CostAnalysis({ history, currentPower }: CostAnalysisProps) {
  // Aggregate real energy usage from history by summing positive deltas to handle device resets gracefully
  const calculateEnergySince = (sinceMs: number) => {
    if (!history || history.length < 2) return 0;
    const recentHistory = history.filter(r => r.timestamp >= sinceMs);
    if (recentHistory.length < 2) return 0;

    let totalGenerated = 0;
    for (let i = 1; i < recentHistory.length; i++) {
      const delta = recentHistory[i].energy - recentHistory[i - 1].energy;
      // Only sum positive, reasonable deltas (ignore massive spikes or negative resets)
      if (delta > 0 && delta < 500) {
        totalGenerated += delta;
      }
    }
    return totalGenerated;
  };

  const now = Date.now();
  const startOfDay = new Date().setHours(0, 0, 0, 0);
  const startOfMonth = now - (30 * 24 * 60 * 60 * 1000);
  const startOfYear = now - (365 * 24 * 60 * 60 * 1000);

  const todayEnergy = calculateEnergySince(startOfDay);
  const monthEnergy = calculateEnergySince(startOfMonth);
  const yearEnergy = calculateEnergySince(startOfYear);

  const todayCost = todayEnergy * ELECTRICITY_RATE;
  const monthCost = monthEnergy * ELECTRICITY_RATE;
  const yearCost = yearEnergy * ELECTRICITY_RATE;

  // Estimate daily cost based on current power usage
  const hourlyEstimate = (currentPower / 1000) * ELECTRICITY_RATE;
  const dailyEstimate = hourlyEstimate * 24;

  return (
    <div className="bg-white dark:bg-slate-900/40 p-6 rounded-[20px] border border-slate-100/80 dark:border-slate-800/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] backdrop-blur-xl h-full flex flex-col transition-colors">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Cost Analysis</h3>
        <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-lg">
          <Zap size={10} />
          LIVE
        </div>
      </div>

      <div className="space-y-3 flex-1">
        <CostItem
          label="Today"
          energy={todayEnergy}
          cost={todayCost}
          icon={IndianRupee}
          color="text-amber-500"
          bgColor="bg-amber-50 dark:bg-amber-900/20"
        />
        <CostItem
          label="This Month"
          energy={monthEnergy}
          cost={monthCost}
          icon={TrendingUp}
          color="text-emerald-500"
          bgColor="bg-emerald-50 dark:bg-emerald-900/20"
        />
        <CostItem
          label="This Year"
          energy={yearEnergy}
          cost={yearCost}
          icon={Calendar}
          color="text-blue-500"
          bgColor="bg-blue-50 dark:bg-blue-900/20"
        />
      </div>

      {/* Rate and estimate */}
      <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-800 space-y-2 transition-colors">
        <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-xl transition-colors">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Current Rate</span>
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">₹{ELECTRICITY_RATE.toFixed(2)}/kWh</span>
        </div>
        <div className="flex justify-between items-center bg-amber-50 dark:bg-amber-900/10 p-3 rounded-xl transition-colors">
          <div>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Est. Daily Cost</span>
            <p className="text-[10px] text-amber-500/70 dark:text-amber-400/50">@ current {currentPower.toFixed(1)}W</p>
          </div>
          <span className="text-sm font-bold text-amber-700 dark:text-amber-300">₹{dailyEstimate.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

function CostItem({ label, energy, cost, icon: Icon, color, bgColor }: any) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors group">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${bgColor} ${color} transition-colors`}>
          <Icon size={18} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{energy.toFixed(3)} kWh</p>
        </div>
      </div>
      <span className="text-lg font-bold text-slate-800 dark:text-slate-100">₹{cost.toFixed(2)}</span>
    </div>
  );
}
