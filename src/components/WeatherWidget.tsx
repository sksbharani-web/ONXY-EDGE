import React from 'react';
import { CloudSun, Wind, Droplets, MapPin, Search, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WeatherData } from '@/types';

export interface LocationData {
  name: string;
  latitude: number;
  longitude: number;
}

interface WeatherWidgetProps {
  weather: WeatherData | null;
  location: LocationData;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: (e: React.FormEvent) => void;
  onUseCurrentLocation: () => void;
  onRefresh: () => void;
  loading: boolean;
  isSearching: boolean;
  error: string | null;
}

export function WeatherWidget({
  weather,
  location,
  searchQuery,
  onSearchQueryChange,
  onSearch,
  onUseCurrentLocation,
  onRefresh,
  loading,
  isSearching,
  error
}: WeatherWidgetProps) {

  return (
    <div className="bg-white dark:bg-slate-900/40 p-6 rounded-[20px] border border-slate-100/80 dark:border-slate-800/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] backdrop-blur-xl h-full flex flex-col transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CloudSun className="text-amber-500 w-5 h-5" />
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Weather Impact</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onUseCurrentLocation}
            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            title="Use current location"
          >
            <MapPin size={16} />
          </button>
          <button
            onClick={onRefresh}
            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            title="Refresh weather"
          >
            <RefreshCw size={16} className={cn(loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={onSearch} className="mb-4 relative">
        <input
          type="text"
          placeholder="Search city..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-slate-200 transition-all"
        />
        <Search className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500 w-4 h-4" />
        {isSearching && (
          <div className="absolute right-3 top-2.5">
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          </div>
        )}
      </form>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-lg border border-red-100 dark:border-red-900/30 flex justify-between items-center">
          <span>{error}</span>
          <button type="button" onClick={onRefresh} className="underline hover:text-red-700 dark:hover:text-red-300">Retry</button>
        </div>
      )}

      <div className="flex-1 flex flex-col justify-between">
        <div className="text-center mb-4">
          <h4 className="text-slate-500 dark:text-slate-400 font-medium text-sm flex items-center justify-center gap-1">
            <MapPin size={12} />
            {location.name}
          </h4>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-all hover:bg-amber-50 dark:hover:bg-amber-900/20 group">
            <CloudSun className="text-amber-500 w-6 h-6 group-hover:scale-110 transition-transform" />
            <div className="text-center">
              <span className="block text-lg font-bold text-slate-800 dark:text-slate-100">
                {loading || !weather ? '-' : weather.temperature}°C
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Temp</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20 group">
            <Droplets className="text-blue-500 w-6 h-6 group-hover:scale-110 transition-transform" />
            <div className="text-center">
              <span className="block text-lg font-bold text-slate-800 dark:text-slate-100">
                {loading || !weather ? '-' : weather.humidity}%
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Humidity</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-all hover:bg-slate-200 dark:hover:bg-slate-700 group">
            <Wind className="text-slate-500 dark:text-slate-400 w-6 h-6 group-hover:scale-110 transition-transform" />
            <div className="text-center">
              <span className="block text-lg font-bold text-slate-800 dark:text-slate-100">
                {loading || !weather ? '-' : weather.windSpeed}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">km/h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
