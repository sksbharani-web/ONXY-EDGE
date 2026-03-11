import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { EnergyReading } from '@/types';
import { Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface AIPredictionProps {
  recentHistory: EnergyReading[];
}

export function AIPrediction({ recentHistory }: AIPredictionProps) {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);

    try {
      // Prepare data summary for AI
      // Take last 20 readings to keep prompt size manageable but useful
      const dataSample = recentHistory.slice(-20).map(r => ({
        time: new Date(r.timestamp).toLocaleTimeString(),
        power: r.power,
        voltage: r.voltage
      }));

      const prompt = `
        Analyze this recent energy monitoring data (last 20 readings):
        ${JSON.stringify(dataSample)}

        Please provide:
        1. A brief analysis of the current power consumption trend.
        2. Any anomalies detected (voltage fluctuations, power spikes).
        3. A prediction for energy usage in the next hour based on this trend.
        4. One actionable tip for energy efficiency.

        Keep the response concise and formatted in Markdown.
      `;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      setPrediction(response.text);
    } catch (err) {
      console.error("AI Error:", err);
      setError("Failed to generate prediction. Please check your API key configuration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <Sparkles className="text-purple-400" size={20} />
          AI Insights
        </h3>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
            loading 
              ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
              : "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20"
          )}
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
          {loading ? "Analyzing..." : "Analyze Now"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-[200px] bg-slate-950/50 rounded-lg p-4 border border-slate-800/50">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-rose-400 gap-2">
            <AlertTriangle size={24} />
            <p className="text-sm text-center">{error}</p>
          </div>
        ) : prediction ? (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{prediction}</ReactMarkdown>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
            <Sparkles size={32} className="opacity-20" />
            <p className="text-sm text-center max-w-[200px]">
              Click "Analyze Now" to get real-time insights powered by Gemini AI.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
