import React, { useState } from 'react';
import { User, Bell, Shield, Globe, Moon, Save, LogOut, Trash2, Download, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { EnergyReading } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface UserSettingsProps {
  userEmail: string;
  userName: string;
  onLogout: () => void;
  history: EnergyReading[];
  theme: string;
  onThemeChange: (theme: string) => void;
}

export function UserSettings({ userEmail, userName, onLogout, history, theme, onThemeChange }: UserSettingsProps) {
  const [displayName, setDisplayName] = useState(userName);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  const handleExportCSV = () => {
    if (!history || history.length === 0) {
      alert("No data available to export.");
      return;
    }

    try {
      const headers = ["Timestamp", "Date", "Voltage (V)", "Current (A)", "Power (W)", "Energy (kWh)"];
      const csvContent = [
        headers.join(","),
        ...history.map(reading => {
          const date = new Date(reading.timestamp).toISOString();
          return [
            reading.timestamp,
            date,
            reading.voltage,
            reading.current,
            reading.power,
            reading.energy
          ].join(",");
        })
      ].join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `energy_data_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("CSV export failed:", error);
      alert(`Failed to export CSV: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleExportPDF = () => {
    if (!history || history.length === 0) {
      alert("No data available to export.");
      return;
    }

    try {
      const doc = new jsPDF();

      // Title
      doc.setFontSize(18);
      doc.text("Energy Usage Report", 14, 22);

      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
      doc.text(`User: ${userEmail}`, 14, 36);
      doc.text(`Total Records: ${history.length}`, 14, 42);

      // Table
      const tableColumn = ["Date", "Time", "Voltage (V)", "Current (A)", "Power (W)", "Energy (kWh)"];
      const tableRows = history.map(reading => {
        const dateObj = new Date(reading.timestamp);
        return [
          dateObj.toLocaleDateString(),
          dateObj.toLocaleTimeString(),
          reading.voltage.toFixed(1),
          reading.current.toFixed(2),
          reading.power.toFixed(0),
          reading.energy.toFixed(3)
        ];
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 50,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [37, 99, 235] } // Blue header
      });

      doc.save(`energy_report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("PDF export failed:", error);
      alert(`Failed to export PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Settings</h2>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
        >
          <Save size={18} />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Navigation/Summary */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-center transition-colors duration-300">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-3xl font-bold text-slate-400 dark:text-slate-500 mx-auto mb-4">
              {displayName.charAt(0).toUpperCase() || 'U'}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate">{displayName}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm truncate">{userEmail}</p>
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium">
              Free Plan
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
            <div className="p-4 border-b border-slate-50 dark:border-slate-800 font-medium text-slate-700 dark:text-slate-300 flex justify-between items-center">
              <span>Quick Actions</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">{history?.length || 0} records</span>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              <button
                onClick={handleExportCSV}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <Download size={16} />
                Export CSV
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <FileText size={16} />
                Export PDF
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">
                <Trash2 size={16} />
                Clear History
              </button>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <LogOut size={16} />
                Log Out
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Settings Forms */}
        <div className="md:col-span-2 space-y-6">

          {/* Profile Settings */}
          <Section title="Profile Information" icon={User} description="Update your personal information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-slate-200 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                <input
                  type="email"
                  value={userEmail}
                  disabled
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>
          </Section>

          {/* Preferences */}
          <Section title="Preferences" icon={Globe} description="Customize your dashboard experience">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Theme</label>
                <select
                  value={theme}
                  onChange={(e) => onThemeChange(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-slate-200 transition-all"
                >
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                  <option value="system">System Default</option>
                </select>
              </div>
            </div>
          </Section>

          {/* Notifications */}
          <Section title="Notifications" icon={Bell} description="Manage how you receive alerts">
            <div className="space-y-4">
              <Toggle
                label="Email Alerts"
                description="Receive critical alerts via email"
                checked={emailAlerts}
                onChange={setEmailAlerts}
              />
              <Toggle
                label="Push Notifications"
                description="Receive real-time updates on your device"
                checked={pushNotifications}
                onChange={setPushNotifications}
              />
            </div>
          </Section>

          {/* Security */}
          <Section title="Security" icon={Shield} description="Manage your account security">
            <button className="text-blue-600 dark:text-blue-400 font-medium text-sm hover:underline">
              Change Password
            </button>
          </Section>

        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, description, children }: { title: string, icon: any, description: string, children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
          <Icon size={20} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Toggle({ label, description, checked, onChange }: { label: string, description: string, checked: boolean, onChange: (checked: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-slate-700 dark:text-slate-300">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          "w-12 h-6 rounded-full transition-colors relative",
          checked ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
        )}
      >
        <div className={cn(
          "w-4 h-4 bg-white rounded-full absolute top-1 transition-transform",
          checked ? "left-7" : "left-1"
        )} />
      </button>
    </div>
  );
}
