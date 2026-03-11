import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import firebaseConfig from '../../firebase-applet-config.json';

export function ConfigDebug() {
  const [isOpen, setIsOpen] = React.useState(false);

  const envVars = [
    { key: 'apiKey', label: 'API Key' },
    { key: 'authDomain', label: 'Auth Domain' },
    { key: 'projectId', label: 'Project ID' },
  ];

  const checkVar = (key: keyof typeof firebaseConfig) => {
    const val = firebaseConfig[key];
    if (!val) return 'missing';
    return 'ok';
  };

  const allOk = envVars.every(v => checkVar(v.key as any) === 'ok');

  if (allOk && !isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all",
            allOk 
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20" 
              : "bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 animate-pulse"
          )}
        >
          {allOk ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          <span className="text-xs font-medium">{allOk ? "Config Configured" : "Config Missing"}</span>
        </button>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 w-80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <HelpCircle size={16} className="text-indigo-400" />
              Firebase Configuration
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-300">
              <XCircle size={16} />
            </button>
          </div>
          
          <div className="space-y-3">
            {envVars.map((v) => {
              const status = checkVar(v.key as any);
              return (
                <div key={v.key} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{v.label}</span>
                  <div className="flex items-center gap-1.5">
                    {status === 'ok' && (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle size={12} /> Set
                      </span>
                    )}
                    {status === 'missing' && (
                      <span className="text-rose-400 flex items-center gap-1">
                        <XCircle size={12} /> Missing
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800">
            <p className="text-[10px] text-slate-500 leading-relaxed">
              To see real data, add these values to your <code className="bg-slate-800 px-1 rounded">firebase-applet-config.json</code> file.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
