import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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

// Custom tooltip for multi-parameter display
const CustomTooltip = ({ active, payload, label, isDark }: any) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div style={{
      borderRadius: '14px',
      border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      backgroundColor: isDark ? '#0f172a' : '#ffffff',
      color: isDark ? '#f1f5f9' : '#1e293b',
      padding: '12px 16px',
      fontSize: '12px',
      minWidth: '180px',
    }}>
      <p style={{ fontWeight: 600, marginBottom: 8, color: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}>{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: entry.color, display: 'inline-block' }} />
            <span style={{ color: isDark ? '#cbd5e1' : '#475569' }}>{entry.name}</span>
          </span>
          <span style={{ fontWeight: 700, color: entry.color, marginLeft: 12 }}>
            {entry.value.toFixed(entry.name === 'Voltage (V)' ? 1 : entry.name === 'Energy (kWh)' ? 4 : 2)}
            {entry.name === 'Voltage (V)' ? ' V' : entry.name === 'Power (W)' ? ' W' : ' kWh'}
          </span>
        </div>
      ))}
    </div>
  );
};

export function EnergyChart({ data, timeRange, onTimeRangeChange }: EnergyChartProps) {
  const isDark = useDarkMode();

  // Sample data at ~10 minute intervals for clean display
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
    const source = filtered.length > 0 ? filtered : data.slice(-200);

    // Sample at 10-minute intervals
    const TEN_MIN = 10 * 60 * 1000;
    const sampled: EnergyReading[] = [];
    let lastSampledTime = 0;

    for (const reading of source) {
      if (reading.timestamp - lastSampledTime >= TEN_MIN || lastSampledTime === 0) {
        sampled.push(reading);
        lastSampledTime = reading.timestamp;
      }
    }

    // Always include the latest reading
    if (source.length > 0 && sampled[sampled.length - 1] !== source[source.length - 1]) {
      sampled.push(source[source.length - 1]);
    }

    // Cap at 50 for clean display
    const displayData = sampled.slice(-50);

    // Normalize energy relative to the start of this view for clear visualization
    const minEnergy = displayData.length > 0 ? displayData[0].energy : 0;

    return displayData.map((reading) => ({
      time: new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      voltage: Number(reading.voltage.toFixed(1)),
      power: Number(reading.power.toFixed(2)),
      energy: Number((reading.energy - minEnergy).toFixed(4)),
      rawEnergy: reading.energy, // Store raw if needed
    }));
  }, [data, timeRange]);

  // Summary stats (Session based)
  const stats = useMemo(() => {
    if (!data || data.length === 0) return { totalEnergy: 0, totalCost: 0, avgVoltage: 0 };
    const firstReading = data[0];
    const lastReading = data[data.length - 1];
    const totalEnergy = Math.max(0, (lastReading?.energy || 0) - (firstReading?.energy || 0));
    const totalCost = totalEnergy * ELECTRICITY_RATE;
    const avgVoltage = data.reduce((sum, r) => sum + r.voltage, 0) / data.length;
    return { totalEnergy, totalCost, avgVoltage };
  }, [data]);

  return (
    <div className="bg-white dark:bg-slate-900/40 p-6 rounded-[20px] border border-slate-100/80 dark:border-slate-800/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] backdrop-blur-xl h-full flex flex-col transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Energy Monitoring</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">Real-time readings sampled every 10 min</p>
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
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-3 py-2">
          <p className="text-[10px] text-emerald-500 dark:text-emerald-400 font-medium">Avg Voltage</p>
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{stats.avgVoltage.toFixed(1)} V</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2">
          <p className="text-[10px] text-blue-500 dark:text-blue-400 font-medium">Energy</p>
          <p className="text-sm font-bold text-blue-700 dark:text-blue-300">{stats.totalEnergy.toFixed(3)} kWh</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
          <p className="text-[10px] text-amber-500 dark:text-amber-400 font-medium">Cost</p>
          <p className="text-sm font-bold text-amber-700 dark:text-amber-300">₹{stats.totalCost.toFixed(3)}</p>
        </div>
      </div>

      <div className="flex-1 min-h-[280px] min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <LineChart data={chartData} margin={{ top: 5, right: 15, left: -15, bottom: 0 }}>
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
              yAxisId="powerAxis"
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 10 }}
              label={{ value: 'Voltage & Power', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: isDark ? '#64748b' : '#94a3b8' } }}
            />
            <YAxis
              yAxisId="energyAxis"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 10 }}
              label={{ value: 'Energy (kWh)', angle: 90, position: 'insideRight', style: { fontSize: 10, fill: isDark ? '#64748b' : '#94a3b8' } }}
            />
            <Tooltip
              content={<CustomTooltip isDark={isDark} />}
              cursor={{ stroke: isDark ? '#475569' : '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: isDark ? '#94a3b8' : '#64748b' }} />

            <Line yAxisId="powerAxis" type="monotone" dataKey="voltage" name="Voltage (V)" stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#10b981" }} />
            <Line yAxisId="powerAxis" type="monotone" dataKey="power" name="Power (W)" stroke="#3b82f6" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#3b82f6" }} />
            <Line yAxisId="energyAxis" type="monotone" dataKey="energy" name="Energy (kWh)" stroke="#f59e0b" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#f59e0b" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
