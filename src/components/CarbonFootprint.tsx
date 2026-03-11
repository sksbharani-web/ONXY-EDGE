import React from 'react';
import { Leaf, TrendingDown, TrendingUp } from 'lucide-react';
import { CO2_FACTOR } from '@/types';

interface CarbonFootprintProps {
  totalEnergy: number;     // Total kWh consumed (from RTDB)
  realtimeCarbon: number;  // Direct CarbonFootprint from RTDB
  currentPower: number;    // Current power in watts
}

export function CarbonFootprint({ totalEnergy, realtimeCarbon, currentPower }: CarbonFootprintProps) {
  // Calculate emissions from energy OR use the real-time value from RTDB
  const computedCarbon = totalEnergy * CO2_FACTOR;
  const displayCarbon = realtimeCarbon > 0 ? realtimeCarbon : computedCarbon;

  // Daily and yearly estimates
  const dailyEstimate = (currentPower / 1000) * CO2_FACTOR * 24;
  const monthlyEstimate = dailyEstimate * 30;

  // Gauge visualization
  const maxVal = Math.max(1, monthlyEstimate * 2); // Scale relative to expected
  const percentage = Math.min(100, (displayCarbon / maxVal) * 100);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Determine severity
  const isLow = displayCarbon < 0.1;

  return (
    <div className="bg-white dark:bg-slate-900/40 p-6 rounded-[20px] border border-slate-100/80 dark:border-slate-800/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] backdrop-blur-xl flex flex-col items-center h-full transition-colors">
      <div className="flex items-center gap-2 mb-4 w-full">
        <Leaf className="text-emerald-500 w-5 h-5" />
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Carbon Footprint</h3>
        {isLow && (
          <span className="ml-auto text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full flex items-center gap-0.5">
            <TrendingDown size={10} /> LOW
          </span>
        )}
      </div>

      <div className="relative w-48 h-48 flex items-center justify-center my-2">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="64"
            className="stroke-slate-100 dark:stroke-slate-800 fill-none transition-colors"
            strokeWidth="8"
          />
          <circle
            cx="50%"
            cy="50%"
            r="64"
            className={`fill-none transition-all duration-1000 ease-out ${isLow ? 'stroke-emerald-500' : 'stroke-amber-500'}`}
            strokeWidth="8"
            strokeLinecap="round"
            style={{
              strokeDasharray: 2 * Math.PI * 64,
              strokeDashoffset: (2 * Math.PI * 64) - (percentage / 100) * (2 * Math.PI * 64)
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold transition-colors ${isLow ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
            {displayCarbon < 0.01 ? displayCarbon.toFixed(4) : displayCarbon.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">kg CO₂</span>
        </div>
      </div>

      <div className="text-center w-full space-y-2 mt-auto">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium text-left">Emissions Summary</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 text-center">
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Today est.</p>
            <p className="font-semibold text-slate-700 dark:text-slate-300">{dailyEstimate.toFixed(3)} kg</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 text-center">
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Monthly est.</p>
            <p className="font-semibold text-slate-700 dark:text-slate-300">{monthlyEstimate.toFixed(2)} kg</p>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 text-left pt-1">Factor: {CO2_FACTOR} kg CO₂/kWh (India Grid)</p>
      </div>
    </div>
  );
}
