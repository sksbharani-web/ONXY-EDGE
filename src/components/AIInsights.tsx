import React, { useMemo } from 'react';
import { Cpu, Activity, Zap, TrendingDown, TrendingUp, Minus, Lightbulb } from 'lucide-react';
import { EnergyReading, WeatherData } from '@/types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AIInsightsProps {
    currentReading: EnergyReading | null;
    history: EnergyReading[];
    weather: WeatherData | null;
}

export function AIInsights({ currentReading, history, weather }: AIInsightsProps) {

    // Memoized insights calculations
    const insights = useMemo(() => {
        if (!currentReading) return null;

        // 1. Voltage Quality
        const v = currentReading.voltage;
        let voltageStatus = "Optimal";
        let voltageColor = "text-emerald-500";
        if (v < 210 || v > 250) {
            voltageStatus = "Warning";
            voltageColor = "text-rose-500";
        } else if (v < 220 || v > 240) {
            voltageStatus = "Fair";
            voltageColor = "text-amber-500";
        }

        // 2. Power Factor
        let pf = 0;
        if (v > 0 && currentReading.current > 0) {
            pf = currentReading.power / (v * currentReading.current);
        }
        // Clamp between 0 and 1
        pf = Math.min(Math.max(pf, 0), 1);

        let pfStatus = "Excellent";
        let pfColor = "text-emerald-500";
        if (pf < 0.8) {
            pfStatus = "Poor";
            pfColor = "text-rose-500";
        } else if (pf < 0.9) {
            pfStatus = "Good";
            pfColor = "text-blue-500";
        }

        // 3. Peak Load & Current Load percentage
        let peakLoad = currentReading.power;
        history.forEach(r => {
            if (r.power > peakLoad) peakLoad = r.power;
        });
        // Avoid division by zero, set a minimum peak of 1000 for realistic UI scale if data is too low
        const effectivePeak = Math.max(peakLoad, 1000);
        const currentLoadPercentage = Math.min((currentReading.power / effectivePeak) * 100, 100);

        // 4. Trend Analysis (Last 10 readings vs previous 10)
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (history.length >= 20) {
            const recent = history.slice(-10);
            const previous = history.slice(-20, -10);

            const recentAvg = recent.reduce((sum, r) => sum + r.power, 0) / 10;
            const previousAvg = previous.reduce((sum, r) => sum + r.power, 0) / 10;

            // If changed by more than 5%
            if (recentAvg > previousAvg * 1.05) trend = 'up';
            else if (recentAvg < previousAvg * 0.95) trend = 'down';
        } else if (history.length > 1) {
            // simple trend if not enough data
            const last = history[history.length - 1].power;
            const prev = history[history.length - 2].power;
            if (last > prev * 1.05) trend = 'up';
            else if (last < prev * 0.95) trend = 'down';
        }

        return {
            voltageStatus,
            voltageColor,
            pf,
            pfStatus,
            pfColor,
            peakLoad: effectivePeak,
            currentLoadPercentage,
            trend
        };
    }, [currentReading, history]);

    // Contextual weather and device-aware suggestion
    const suggestion = useMemo(() => {
        if (!currentReading || !weather) return "Collecting ambient data for suggestions...";

        const w = currentReading.power;
        const t = weather.temperature;

        // Device Signature Inference
        let presumedDevice = "Unknown Load";
        if (w < 50) presumedDevice = "Standby / Router";
        else if (w < 150) presumedDevice = "Lighting / Fan";
        else if (w < 400) presumedDevice = "TV / PC / Fridge Compressor";
        else if (w < 1000) presumedDevice = t > 28 ? "1-Ton AC" : "Water Heater / Geyser";
        else presumedDevice = t > 28 ? "1.5+ Ton AC" : "Heavy Heating Load";

        // Contextual AI Advice
        if (w >= 1000 && t > 32) {
            return `High load detected (${(w / 1000).toFixed(1)}kW). Likely your ${presumedDevice}. Outside temp is a hot ${t}°C. Try setting AC to 25°C to save ~10% energy while staying cool.`;
        } else if (w >= 1000 && t < 22) {
            return `High load detected (${(w / 1000).toFixed(1)}kW) in cool ${t}°C weather. If using a Water Heater or Room Heater, limit use to 20 mins to prevent energy waste.`;
        } else if (w >= 400 && w < 1000 && t > 25 && t < 32) {
            return `Moderate load (${w.toFixed(0)}W). Weather is mild (${t}°C). If this is a fan or cooler, you are running efficiently!`;
        } else if (w > 500 && t >= 22 && t <= 25) {
            return `High base load (${w.toFixed(0)}W) despite perfect ${t}°C weather. Check if appliances like the AC were left on unnecessarily.`;
        } else if (w < 150) {
            return `Excellent efficiency (${w.toFixed(0)}W). Likely just ${presumedDevice}. Your standby power consumption is comfortably low.`;
        }

        return `Current load is ${w.toFixed(0)}W (${presumedDevice}). System operating within standard parameters for ${t}°C ambient temperature.`;
    }, [currentReading, weather]);

    if (!currentReading || !insights) {
        return (
            <div className="bg-white dark:bg-slate-900/40 p-6 rounded-[20px] border border-slate-100/80 dark:border-slate-800/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] backdrop-blur-xl transition-colors xl:col-span-1 h-full flex flex-col justify-center items-center gap-3">
                <Cpu className="w-8 h-8 text-slate-300 dark:text-slate-600 animate-pulse" />
                <p className="text-sm text-slate-400">Gathering Insights...</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900/40 p-6 rounded-[20px] border border-slate-100/80 dark:border-slate-800/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] backdrop-blur-xl transition-colors xl:col-span-1 flex flex-col h-full relative overflow-hidden group">

            {/* Background Soft Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors duration-700 pointer-events-none" />

            <div className="flex items-center gap-2 mb-4 relative z-10">
                <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                    <Cpu className="text-blue-500 w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">AI Insights</h3>
            </div>

            <div className="space-y-4 flex-1 relative z-10">

                {/* Load Analysis */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-700/30">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-slate-400">Current Load vs Peak</span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            {currentReading.power.toFixed(0)}W <span className="text-[10px] text-slate-400 font-normal">/ {insights.peakLoad.toFixed(0)}W</span>
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden relative">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${insights.currentLoadPercentage}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className={cn(
                                "h-full rounded-full transition-colors duration-500",
                                insights.currentLoadPercentage > 85 ? "bg-rose-500" :
                                    insights.currentLoadPercentage > 60 ? "bg-amber-500" : "bg-blue-500"
                            )}
                        />
                    </div>
                </div>

                {/* Dynamic Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 mt-4">

                    {/* Voltage Quality */}
                    <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-700/30">
                        <div className="flex items-center justify-between mb-1">
                            <Activity className={cn("w-3.5 h-3.5", insights.voltageColor)} />
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Voltage</span>
                        </div>
                        <div className="flex items-end gap-1.5 mt-2">
                            <span className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-none">
                                {currentReading.voltage.toFixed(0)}V
                            </span>
                            <span className={cn("text-xs font-medium pb-[1px]", insights.voltageColor)}>
                                {insights.voltageStatus}
                            </span>
                        </div>
                    </div>

                    {/* Power Factor */}
                    <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-700/30">
                        <div className="flex items-center justify-between mb-1">
                            <Zap className={cn("w-3.5 h-3.5", insights.pfColor)} />
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">P. Factor</span>
                        </div>
                        <div className="flex items-end gap-1.5 mt-2">
                            <span className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-none">
                                {insights.pf.toFixed(2)}
                            </span>
                            <span className={cn("text-xs font-medium pb-[1px]", insights.pfColor)}>
                                {insights.pfStatus}
                            </span>
                        </div>
                    </div>

                    {/* Consumption Trend */}
                    <div className="col-span-2 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-700/30 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Consumption Trend</span>
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                {insights.trend === 'up' && "Load is increasing"}
                                {insights.trend === 'down' && "Load is decreasing"}
                                {insights.trend === 'stable' && "Load is stable"}
                            </span>
                        </div>
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            insights.trend === 'up' ? "bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400" :
                                insights.trend === 'down' ? "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400" :
                                    "bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400"
                        )}>
                            {insights.trend === 'up' && <TrendingUp className="w-4 h-4" />}
                            {insights.trend === 'down' && <TrendingDown className="w-4 h-4" />}
                            {insights.trend === 'stable' && <Minus className="w-4 h-4" />}
                        </div>
                    </div>

                    {/* Climate AI Suggestion */}
                    <div className="col-span-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/20 flex gap-3 items-start mt-1">
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg shrink-0 mt-0.5">
                            <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block mb-0.5">Contextual Advice</span>
                            <span className="text-xs font-medium text-blue-800 dark:text-blue-300 leading-snug">
                                {suggestion}
                            </span>
                        </div>
                    </div>

                </div>

            </div>

            <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/60 relative z-10 flex items-center justify-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Real-time Analysis</p>
            </div>
        </div>
    );
}
