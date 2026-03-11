import React, { useState, useMemo } from 'react';
import { Download, FileJson, FileSpreadsheet, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { EnergyReading, TimeRange, ELECTRICITY_RATE } from '@/types';
import { EnergyChart } from './EnergyChart';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { cn } from '@/lib/utils';

interface AnalysisPageProps {
    history: EnergyReading[];
    timeRange: TimeRange;
    onTimeRangeChange: (range: TimeRange) => void;
}

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#6366f1', '#ec4899'];

export function AnalysisPage({ history, timeRange, onTimeRangeChange }: AnalysisPageProps) {
    const [isExporting, setIsExporting] = useState(false);

    // Calculate stats
    const stats = useMemo(() => {
        if (!history || history.length === 0) return { totalEnergy: 0, totalCost: 0, avgPower: 0, peakPower: 0 };

        let sumPower = 0;
        let peakPower = 0;

        history.forEach(r => {
            sumPower += r.power;
            if (r.power > peakPower) peakPower = r.power;
        });

        const totalEnergy = history[history.length - 1]?.energy || 0;
        const totalCost = totalEnergy * ELECTRICITY_RATE;
        const avgPower = sumPower / history.length;

        return { totalEnergy, totalCost, avgPower, peakPower };
    }, [history]);

    // Aggregate data for Pie Chart (Real Distribution based on data signatures)
    const pieData = useMemo(() => {
        if (!history || history.length === 0) return [];

        let standby = 0; // < 50W
        let lighting = 0; // 50W - 200W
        let appliances = 0; // 200W - 1000W
        let hvac = 0; // > 1000W

        history.forEach(r => {
            const p = r.power;
            if (p < 50) standby += p;
            else if (p < 200) lighting += p;
            else if (p < 1000) appliances += p;
            else hvac += p;
        });

        const totalAnalyzed = standby + lighting + appliances + hvac;
        if (totalAnalyzed === 0) return [];

        return [
            { name: 'HVAC / Cooling', value: hvac },
            { name: 'Lighting & Fans', value: lighting },
            { name: 'Appliances', value: appliances },
            { name: 'Standby / Low Power', value: standby },
        ].filter(item => item.value > 0);
    }, [history]);

    // Calculate Efficiency Score based on the ratio of low-power to high-power usage times.
    const efficiencyScore = useMemo(() => {
        if (!history || history.length < 10) return "N/A";
        let highPowerCount = 0;
        history.forEach(r => { if (r.power > 1500) highPowerCount++; });
        const efficiency = 100 - ((highPowerCount / history.length) * 100);
        return Math.max(0, Math.min(100, efficiency)).toFixed(0);
    }, [history]);


    const exportCSV = () => {
        setIsExporting(true);
        try {
            const headers = ['Timestamp', 'Time', 'Voltage (V)', 'Current (A)', 'Power (W)', 'Energy (kWh)', 'Cost (₹)'];
            const rows = history.map(r => {
                const date = new Date(r.timestamp);
                const cost = r.energy * ELECTRICITY_RATE;
                return [
                    date.toISOString(),
                    date.toLocaleTimeString(),
                    r.voltage.toFixed(2),
                    r.current.toFixed(3),
                    r.power.toFixed(2),
                    r.energy.toFixed(4),
                    cost.toFixed(2)
                ].join(',');
            });

            const csvContent = [headers.join(','), ...rows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `onxy_edge_export_${new Date().getTime()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } finally {
            setIsExporting(false);
        }
    };

    const exportJSON = () => {
        setIsExporting(true);
        try {
            const dataStr = JSON.stringify(history, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `onxy_edge_export_${new Date().getTime()}.json`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/40 p-6 rounded-[20px] border border-slate-100/80 dark:border-slate-800/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] backdrop-blur-xl transition-colors">
                <div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400">
                        Data Analysis
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Deep dive into your energy consumption patterns and export historical data.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={exportCSV}
                        disabled={isExporting || history.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                        <FileSpreadsheet size={16} />
                        CSV
                    </button>
                    <button
                        onClick={exportJSON}
                        disabled={isExporting || history.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                        <FileJson size={16} />
                        JSON
                    </button>
                </div>
            </div>

            {/* Main Charts area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Col: Main Timeline Chart */}
                <div className="lg:col-span-2 h-[450px]">
                    <EnergyChart data={history} timeRange={timeRange} onTimeRangeChange={onTimeRangeChange} />
                </div>

                {/* Right Col: Distribution & Stats */}
                <div className="lg:col-span-1 space-y-6">

                    {/* Pie Chart */}
                    <div className="bg-white dark:bg-slate-900/40 p-6 rounded-[20px] border border-slate-100/80 dark:border-slate-800/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] backdrop-blur-xl flex flex-col h-[280px] transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                            <PieChartIcon className="w-5 h-5 text-indigo-500" />
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Load Category Breakdown</h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Inferred from real-time wattage signatures</p>

                        <div className="flex-1 min-h-0">
                            {pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={70}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number) => [`${value.toFixed(1)} W`, 'Power']}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                                    Not enough data collected
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats Summary */}
                    <div className="bg-white dark:bg-slate-900/40 p-6 rounded-[20px] border border-slate-100/80 dark:border-slate-800/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] backdrop-blur-xl transition-colors">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity className="w-5 h-5 text-emerald-500" />
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Performance Metrics</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Peak Load Recorded</span>
                                <span className="font-semibold text-rose-500">{stats.peakPower.toFixed(1)} W</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Average Load</span>
                                <span className="font-semibold text-blue-500">{stats.avgPower.toFixed(1)} W</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Total Energy (Session)</span>
                                <span className="font-semibold text-emerald-500">{stats.totalEnergy.toFixed(3)} kWh</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Efficiency Score</span>
                                <span className="font-semibold text-indigo-500">{efficiencyScore}/100</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Total Cost (Session)</span>
                                <span className="font-semibold text-amber-500">₹{stats.totalCost.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}
