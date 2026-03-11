import { EnergyReading } from '../types';

// Simulation constants
const BASE_VOLTAGE = 230; // 230V standard
const VOLTAGE_FLUCTUATION = 2; // +/- 2V
const BASE_CURRENT = 5; // 5A base load
const CURRENT_FLUCTUATION = 0.5; // +/- 0.5A
const PEAK_LOAD_CHANCE = 0.05; // 5% chance of a spike

let accumulatedEnergy = 1450.5; // Starting kWh

export const generateReading = (isOn: boolean): EnergyReading => {
  const timestamp = Date.now();
  
  if (!isOn) {
    return {
      timestamp,
      voltage: BASE_VOLTAGE + (Math.random() * 1 - 0.5), // Voltage still present even if off (usually)
      current: 0,
      power: 0,
      energy: accumulatedEnergy
    };
  }

  // Simulate voltage fluctuation
  const voltage = BASE_VOLTAGE + (Math.random() * VOLTAGE_FLUCTUATION * 2 - VOLTAGE_FLUCTUATION);

  // Simulate current fluctuation
  let current = BASE_CURRENT + (Math.random() * CURRENT_FLUCTUATION * 2 - CURRENT_FLUCTUATION);
  
  // Occasional spikes (e.g., compressor starting)
  if (Math.random() < PEAK_LOAD_CHANCE) {
    current += Math.random() * 5;
  }

  // Calculate Power (P = V * I)
  const power = voltage * current;

  // Accumulate Energy (kWh)
  // Assuming this function is called every 1 second (1/3600 hours)
  // Energy += Power (kW) * Time (h)
  accumulatedEnergy += (power / 1000) * (1 / 3600);

  return {
    timestamp,
    voltage: parseFloat(voltage.toFixed(1)),
    current: parseFloat(current.toFixed(2)),
    power: Math.round(power),
    energy: parseFloat(accumulatedEnergy.toFixed(3))
  };
};

export const generateHistory = (hours: number): EnergyReading[] => {
  const history: EnergyReading[] = [];
  const now = Date.now();
  const interval = 1000 * 60 * 5; // 5 minute intervals for history
  const steps = (hours * 60) / 5;

  let tempEnergy = accumulatedEnergy - (steps * 0.1); // Back-calculate roughly

  for (let i = steps; i >= 0; i--) {
    const timestamp = now - (i * interval);
    const isDaytime = new Date(timestamp).getHours() >= 8 && new Date(timestamp).getHours() <= 22;
    
    // Simulate daily cycle
    const baseLoad = isDaytime ? 8 : 2;
    const current = baseLoad + (Math.random() * 2 - 1);
    const voltage = 230 + (Math.random() * 2 - 1);
    const power = voltage * current;
    
    tempEnergy += (power / 1000) * (5 / 60); // 5 min duration

    history.push({
      timestamp,
      voltage: parseFloat(voltage.toFixed(1)),
      current: parseFloat(current.toFixed(2)),
      power: Math.round(power),
      energy: parseFloat(tempEnergy.toFixed(3))
    });
  }
  
  return history;
};
