import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { EnergyReading } from '@/types';
import { Send, Bot, User, Loader2, Sparkles, X, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface EnergyChatbotProps {
  currentReading: EnergyReading | null;
  history: EnergyReading[];
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

export function EnergyChatbot({ currentReading, history }: EnergyChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hello! I'm your ONXY EDGE AI. Ask me about your energy usage, anomalies, or efficiency tips." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Prepare context data (summarized to save tokens)
      const recentHistory = history.slice(-20); // Last 20 readings
      const context = `
        Current System State:
        - Voltage: ${currentReading?.voltage} V
        - Current: ${currentReading?.current} A
        - Power: ${currentReading?.power} W
        - Total Energy: ${currentReading?.energy.toFixed(3)} kWh
        
        Recent Trend (Last 20 readings):
        ${JSON.stringify(recentHistory.map(r => ({ t: new Date(r.timestamp).toLocaleTimeString(), p: r.power })))}
      `;

      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: `You are ONXY EDGE AI, an expert energy monitoring assistant. 
          You have access to the user's real-time electrical data.
          
          Your goals:
          1. Analyze power consumption patterns.
          2. Identify anomalies (voltage spikes, high current).
          3. Suggest energy-saving tips.
          4. Be concise, helpful, and technical but accessible.
          
          Current Data Context: ${context}`
        },
        history: messages.map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
        }))
      });

      const result = await chat.sendMessage({ message: userMessage });
      const response = result.text;

      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (err) {
      console.error("Chat Error:", err);
      setMessages(prev => [...prev, { role: 'model', content: "I'm having trouble connecting to the server right now. Please check your API key or internet connection." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-900/20 transition-all hover:scale-105 flex items-center gap-2"
      >
        <MessageSquare size={24} />
        <span className="font-medium hidden md:inline">Ask AI</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-[380px] h-[600px] max-h-[80vh] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-100/80 dark:border-slate-800/60 rounded-[20px] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-slate-100/80 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md flex items-center justify-between transition-colors z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg transition-colors">
            <Sparkles className="text-blue-600 dark:text-blue-400" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">ONXY EDGE</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <p className="text-xs text-slate-500 dark:text-slate-400">Online</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent transition-colors">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex gap-3", m.role === 'user' ? "flex-row-reverse" : "flex-row")}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-colors",
              m.role === 'user' ? "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50" : "bg-blue-500 text-white shadow-blue-500/20"
            )}>
              {m.role === 'user' ? <User size={14} className="text-slate-600 dark:text-slate-300" /> : <Bot size={14} />}
            </div>
            <div className={cn(
              "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm transition-colors backdrop-blur-md",
              m.role === 'user'
                ? "bg-blue-600 text-white rounded-tr-none shadow-blue-600/10"
                : "bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-200 rounded-tl-none"
            )}>
              <ReactMarkdown>{m.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
              <Bot size={14} className="text-white" />
            </div>
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 shadow-sm transition-colors">
              <Loader2 size={16} className="animate-spin text-blue-500 dark:text-blue-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400">Processing...</span>
            </div>
          </div>
        )}

        {/* Suggested Prompts (Only show if no user questions have been asked yet) */}
        {!loading && messages.length === 1 && (
          <div className="flex flex-col gap-2 pt-2 animate-in fade-in duration-500">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 ml-1">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {["Any high usage detected?", "How to reduce my bill?", "What device is running now?"].map(prompt => (
                <button
                  key={prompt}
                  onClick={() => {
                    setInput(prompt);
                    // The user still needs to press send, or we can send immediately.
                    // Let's just populate the input box for them to edit if they want.
                  }}
                  className="text-xs px-3 py-1.5 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/30 border border-blue-100/50 dark:border-blue-800/30 rounded-full transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-t border-slate-100/80 dark:border-slate-800/60 transition-colors z-10">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about energy, costs, devices..."
            className="w-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl py-3 pl-4 pr-12 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all shadow-sm shadow-black/5"
            disabled={loading}
            autoFocus
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-200 dark:disabled:bg-slate-700/50 disabled:text-slate-400 dark:disabled:text-slate-500 text-white rounded-lg transition-colors shadow-sm"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
