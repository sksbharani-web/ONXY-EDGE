import React, { useState, useEffect } from 'react';
import { Settings, Save, Wifi, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeviceSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ip: string) => void;
  currentIp: string;
}

export function DeviceSettings({ isOpen, onClose, onSave, currentIp }: DeviceSettingsProps) {
  const [ip, setIp] = useState(currentIp);
  const [error, setError] = useState('');

  useEffect(() => {
    setIp(currentIp);
  }, [currentIp, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    // Basic IP validation
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (ip && !ipRegex.test(ip)) {
      setError('Please enter a valid IP address (e.g., 192.168.1.100)');
      return;
    }
    setError('');
    onSave(ip);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Settings className="text-slate-400" size={24} />
            Device Settings
          </h2>
          <p className="text-sm text-slate-400 mt-1">Configure your ESP32 connection</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              ESP32 IP Address
            </label>
            <div className="relative">
              <Wifi className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="192.168.1.100"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-rose-400 text-xs mt-2">
                <AlertCircle size={14} />
                {error}
              </div>
            )}
            <p className="text-xs text-slate-500 mt-2">
              Enter the local IP address displayed in the Arduino Serial Monitor after connecting to WiFi.
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-900/20 transition-all flex items-center gap-2"
          >
            <Save size={16} />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
