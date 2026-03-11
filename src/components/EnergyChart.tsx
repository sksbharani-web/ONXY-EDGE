import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, ComposedChart, Line } from 'recharts';
import { EnergyReading, TimeRange, ELECTRICITY_RATE } from '@/types';
import { cn } from '@/lib/utils';

interface EnergyChartProps {
  data: EnergyReading[];
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const checkDark = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

export function EnergyChart({ data, timeRange, onTimeRangeChange }: EnergyChartProps) {
  const isDark = useDarkMode();

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const now = Date.now();
    let cutoff: number;

    switch (timeRange) {
      case '24h':
        cutoff = now - 24 * 60 * 60 * 1000;
        break;
      case 'week':
        cutoff = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case 'month':
        cutoff = now - 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        cutoff = 0;
    }

    const filtered = data.filter(r => r.timestamp >= cutoff);
    const latest = filtered.length > 0 ? filtered : data.slice(-50);

    // Take last 40 data points for clean visualization
    const displayData = latest.slice(-40);

    return displayData.map((reading) => ({
      time: new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      voltage: Number(reading.voltage.toFixed(1)),
      current: Number(reading.current.toFixed(3)),
      power: Number(reading.power.toFixed(2)),
      energy: Number(reading.energy.toFixed(4)),
      cost: Number((reading.energy * ELECTRICITY_RATE).toFixed(4)),
    }));
  }, [data, timeRange]);

  // Summary stats
  const stats = useMemo(() => {
    if (!data || data.length === 0) return { totalEnergy: 0, totalCost: 0, avgPower: 0, maxPower: 0 };
    const totalEnergy = data[data.length - 1]?.energy || 0;
    const totalCost = totalEnergy * ELECTRICITY_RATE;
    const avgPower = data.reduce((sum, r) => sum + r.power, 0) / data.length;
    const maxPower = Math.max(...data.map(r => r.power));
    return { totalEnergy, totalCost, avgPower, maxPower };
  }, [data]);

  return (
    <div className="bg-white dark:bg-slate-900/40 p-6 rounded-[20px] border border-slate-100/80 dark:border-slate-800/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] backdrop-blur-xl h-full flex flex-col transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Energy Consumption</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">Real-time usage vs cost analysis</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl transition-colors">
          {(['24h', 'week', 'month'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => onTimeRangeChange(range)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                timeRange === range
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              )}
            >
              {range === '24h' ? 'Today' : range === 'week' ? 'Week' : 'Month'}
            </button>
          ))}
        </div>
      </div>

      {/* Quick stats bar */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2">
          <p className="text-[10px] text-blue-500 dark:text-blue-400 font-medium">Energy</p>
          <p className="text-sm font-bold text-blue-700 dark:text-blue-300">{stats.totalEnergy.toFixed(3)} kWh</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
          <p className="text-[10px] text-amber-500 dark:text-amber-400 font-medium">Cost</p>
          <p className="text-sm font-bold text-amber-700 dark:text-amber-300">₹{stats.totalCost.toFixed(3)}</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg px-3 py-2">
          <p className="text-[10px] text-purple-500 dark:text-purple-400 font-medium">Avg Power</p>
          <p className="text-sm font-bold text-purple-700 dark:text-purple-300">{stats.avgPower.toFixed(1)} W</p>
        </div>
        <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg px-3 py-2">
          <p className="text-[10px] text-rose-500 dark:text-rose-400 font-medium">Peak</p>
          <p className="text-sm font-bold text-rose-700 dark:text-rose-300">{stats.maxPower.toFixed(1)} W</p>
        </div>
      </div>

      <div className="flex-1 min-h-[250px] min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={isDark ? "#1e293b" : "#f1f5f9"}
            />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 9 }}
              dy={10}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 10 }}
              label={{ value: 'kWh', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: isDark ? '#64748b' : '#94a3b8' } }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 10 }}
              label={{ value: '₹', angle: 90, position: 'insideRight', style: { fontSize: 10, fill: isDark ? '#64748b' : '#94a3b8' } }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: isDark ? '1px solid #1e293b' : 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                color: isDark ? '#f1f5f9' : '#1e293b',
                fontSize: '12px',
              }}
              cursor={{ fill: isDark ? '#1e293b44' : '#f8fafc88' }}
              formatter={(value: number, name: string) => {
                if (name === 'Cost (₹)') return [`₹${value.toFixed(4)}`, name];
                return [value.toFixed(4), name];
              }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: isDark ? '#94a3b8' : '#64748b' }} />
            <Area yAxisId="left" type="monotone" dataKey="energy" name="Energy (kWh)" fill="url(#energyGradient)" stroke="#3b82f6" strokeWidth={2} />
            <Bar yAxisId="right" dataKey="cost" name="Cost (₹)" fill="#f59e0b" radius={[3, 3, 0, 0]} barSize={6} opacity={0.8} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
