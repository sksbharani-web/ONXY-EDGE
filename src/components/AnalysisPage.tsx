import React, { useState, useMemo, useRef } from 'react';
import { motion, Variants } from 'framer-motion';
import { Download, FileJson, FileSpreadsheet, Activity, FileText } from 'lucide-react';
import { EnergyReading, TimeRange, ELECTRICITY_RATE } from '@/types';
import { EnergyChart } from './EnergyChart';
import { cn } from '@/lib/utils';

interface AnalysisPageProps {
    history: EnergyReading[];
    timeRange: TimeRange;
    onTimeRangeChange: (range: TimeRange) => void;
    onExportPDF: () => void;
}



export function AnalysisPage({ history, timeRange, onTimeRangeChange, onExportPDF }: AnalysisPageProps) {
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

        const firstReading = history[0];
        const lastReading = history[history.length - 1];
        const totalEnergy = Math.max(0, (lastReading?.energy || 0) - (firstReading?.energy || 0));

        const totalCost = totalEnergy * ELECTRICITY_RATE;
        const totalCarbon = history.reduce((acc, curr) => acc + (curr.carbonFootprint || 0), 0);
        const avgPower = sumPower / history.length;
        const avgCurrent = history.reduce((acc, curr) => acc + curr.current, 0) / history.length;

        return { totalEnergy, totalCost, totalCarbon, avgPower, peakPower, avgCurrent };
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

    const chartRef = useRef<HTMLDivElement>(null);



    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
        >

            {/* Header & Actions */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/40 p-6 rounded-[20px] border border-slate-100/80 dark:border-slate-800/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] backdrop-blur-xl transition-colors hover:shadow-md">
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
                        onClick={onExportPDF}
                        disabled={isExporting || history.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                        <FileText size={16} />
                        PDF
                    </button>
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
            </motion.div>

            {/* Main Charts area */}
            <div className="space-y-6">

                {/* Full-width Timeline Chart */}
                <motion.div variants={itemVariants} className="h-[450px] p-4 bg-white dark:bg-slate-900/40 rounded-[20px] border border-slate-100/80 dark:border-slate-800/60 shadow-sm" ref={chartRef}>
                    <EnergyChart data={history} timeRange={timeRange} onTimeRangeChange={onTimeRangeChange} />
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Quick Stats Summary */}
                    <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900/40 p-6 rounded-[20px] border border-slate-100/80 dark:border-slate-800/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] backdrop-blur-xl transition-colors hover:shadow-md">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity className="w-5 h-5 text-emerald-500" />
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Performance Metrics</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-lg transition-colors">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Peak Load Recorded</span>
                                <span className="font-semibold text-rose-500">{stats.peakPower.toFixed(1)} W</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-lg transition-colors">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Average Load</span>
                                <span className="font-semibold text-blue-500">{stats.avgPower.toFixed(1)} W</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-lg transition-colors">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Total Energy (Session)</span>
                                <span className="font-semibold text-emerald-500">{stats.totalEnergy.toFixed(3)} kWh</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-lg transition-colors">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Efficiency Score</span>
                                <span className="font-semibold text-indigo-500">{efficiencyScore}/100</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Cost and Carbon Extended metrics */}
                    <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900/40 p-6 rounded-[20px] border border-slate-100/80 dark:border-slate-800/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] backdrop-blur-xl transition-colors hover:shadow-md">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity className="w-5 h-5 text-amber-500" />
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Cost & Environmental Impact</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-lg transition-colors">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Total Cost (Session)</span>
                                <span className="font-semibold text-amber-500">₹{stats.totalCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-lg transition-colors">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Carbon Footprint</span>
                                <span className="font-semibold text-teal-500">{stats.totalCarbon.toFixed(3)} kg CO₂</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-lg transition-colors">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Average Current</span>
                                <span className="font-semibold text-purple-500">{stats.avgCurrent.toFixed(2)} A</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-lg transition-colors">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Electricity Rate</span>
                                <span className="font-semibold text-slate-500">₹{ELECTRICITY_RATE}/kWh</span>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>

        </motion.div>
    );
}
