// Types for our energy data
export interface EnergyReading {
  timestamp: number;
  voltage: number; // Volts
  current: number; // Amps
  power: number;   // Watts
  energy: number;  // kWh (accumulated)
  carbonFootprint?: number; // kg CO₂
}

export interface HistoricalDataPoint {
  date: string;
  value: number;
}

export type TimeRange = '24h' | 'week' | 'month' | 'all';

export interface SystemState {
  isOn: boolean;
  lastReading: EnergyReading;
  history: EnergyReading[];
}

// Indian electricity rate (₹ per kWh) — configurable
export const ELECTRICITY_RATE = 7.5; // Expected cost per kWh in INR

// CO₂ emission factor for India (kg CO₂ per kWh)
export const CO2_FACTOR = 0.82; // kg CO2 per kWh (approximate for India grid)

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  conditionCode: number;
}
