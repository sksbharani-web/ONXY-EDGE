import React from 'react';
import { Users } from 'lucide-react';

interface UsageComparisonProps {
  userUsage: number;
  neighborhoodAvg: number;
  cityAvg: number;
}

export function UsageComparison({ userUsage, neighborhoodAvg, cityAvg }: UsageComparisonProps) {
  const maxVal = Math.max(userUsage, neighborhoodAvg, cityAvg) * 1.2;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm h-full transition-colors">
      <div className="flex items-center gap-2 mb-6">
        <Users className="text-blue-500 w-5 h-5" />
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Usage Comparison</h3>
      </div>

      <div className="space-y-6">
        <ComparisonBar label="Your Usage" value={userUsage} max={maxVal} color="bg-blue-500" />
        <ComparisonBar label="Neighborhood Avg" value={neighborhoodAvg} max={maxVal} color="bg-slate-300 dark:bg-slate-600" />
        <ComparisonBar label="City Avg" value={cityAvg} max={maxVal} color="bg-slate-300 dark:bg-slate-600" />
      </div>

      <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 rounded-xl transition-colors">
        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium leading-relaxed">
          🌿 You're using <span className="font-bold">12% less</span> than your neighborhood average! Keep it up!
        </p>
      </div>
    </div>
  );
}

function ComparisonBar({ label, value, max, color }: any) {
  const width = `${(value / max) * 100}%`;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-slate-500 dark:text-slate-400 font-medium">{label}</span>
        <span className="text-slate-800 dark:text-slate-200 font-bold">{value} kWh</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden transition-colors">
        <div className={`h-full rounded-full ${color} transition-all duration-1000`} style={{ width }} />
      </div>
    </div>
  );
}
