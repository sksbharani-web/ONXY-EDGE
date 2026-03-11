import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, X, Save, Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AlertConfig {
  id: string;
  type: 'power' | 'voltage' | 'current' | 'energy';
  condition: 'above' | 'below';
  threshold: number;
  enabled: boolean;
}

interface EnergyAlertsProps {
  isOpen: boolean;
  onClose: () => void;
  currentReading: any; // Using any for simplicity here, but should be EnergyReading
}

export function EnergyAlerts({ isOpen, onClose, currentReading }: EnergyAlertsProps) {
  const [alerts, setAlerts] = useState<AlertConfig[]>(() => {
    const saved = localStorage.getItem('onxy_edge_alerts');
    return saved ? JSON.parse(saved) : [
      { id: '1', type: 'power', condition: 'above', threshold: 3000, enabled: true },
      { id: '2', type: 'voltage', condition: 'below', threshold: 200, enabled: true },
    ];
  });

  const [activeAlerts, setActiveAlerts] = useState<string[]>([]);

  // Save alerts when changed
  useEffect(() => {
    localStorage.setItem('onxy_edge_alerts', JSON.stringify(alerts));
  }, [alerts]);

  // Check for alerts
  useEffect(() => {
    if (!currentReading) return;

    const newActiveAlerts: string[] = [];

    alerts.forEach(alert => {
      if (!alert.enabled) return;

      let value = 0;
      switch (alert.type) {
        case 'power': value = currentReading.power; break;
        case 'voltage': value = currentReading.voltage; break;
        case 'current': value = currentReading.current; break;
        case 'energy': value = currentReading.energy; break;
      }

      if (alert.condition === 'above' && value > alert.threshold) {
        newActiveAlerts.push(alert.id);
      } else if (alert.condition === 'below' && value < alert.threshold) {
        newActiveAlerts.push(alert.id);
      }
    });

    setActiveAlerts(newActiveAlerts);
  }, [currentReading, alerts]);

  const addAlert = () => {
    const newAlert: AlertConfig = {
      id: Date.now().toString(),
      type: 'power',
      condition: 'above',
      threshold: 0,
      enabled: true
    };
    setAlerts([...alerts, newAlert]);
  };

  const removeAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const updateAlert = (id: string, updates: Partial<AlertConfig>) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-500/10 rounded-xl">
              <Bell className="text-rose-500" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Energy Alerts</h2>
              <p className="text-sm text-slate-400">Configure thresholds for real-time notifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {alerts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Bell size={48} className="mx-auto mb-4 opacity-20" />
              <p>No alerts configured</p>
              <button
                onClick={addAlert}
                className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium"
              >
                Create your first alert
              </button>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border transition-all",
                  activeAlerts.includes(alert.id)
                    ? "bg-rose-500/10 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                    : "bg-slate-950 border-slate-800"
                )}
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  {/* Type Select */}
                  <select
                    value={alert.type}
                    onChange={(e) => updateAlert(alert.id, { type: e.target.value as any })}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="power">Power (W)</option>
                    <option value="voltage">Voltage (V)</option>
                    <option value="current">Current (A)</option>
                    <option value="energy">Energy (kWh)</option>
                  </select>

                  {/* Condition Select */}
                  <select
                    value={alert.condition}
                    onChange={(e) => updateAlert(alert.id, { condition: e.target.value as any })}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="above">Above {'>'}</option>
                    <option value="below">Below {'<'}</option>
                  </select>

                  {/* Threshold Input */}
                  <div className="relative">
                    <input
                      type="number"
                      value={alert.threshold}
                      onChange={(e) => updateAlert(alert.id, { threshold: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>

                  {/* Status Toggle */}
                  <div className="flex items-center justify-between md:justify-end gap-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={alert.enabled}
                        onChange={(e) => updateAlert(alert.id, { enabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>

                    <button
                      onClick={() => removeAlert(alert.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-between items-center">
          <div className="text-sm text-slate-500">
            {activeAlerts.length > 0 && (
              <span className="text-rose-400 flex items-center gap-2">
                <AlertTriangle size={16} />
                {activeAlerts.length} active alert{activeAlerts.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button
            onClick={addAlert}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            Add Alert
          </button>
        </div>
      </div>
    </div>
  );
}
