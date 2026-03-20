import React, { useState, useEffect, useRef } from 'react';
import { Zap, Activity, Battery, Power, Clock, Cpu, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ExportPDFModal } from '@/components/ExportPDFModal';
import { NewMetricCard } from '@/components/NewMetricCard';
import { EnergyChatbot } from '@/components/EnergyChatbot';
import { AIInsights } from '@/components/AIInsights';
import { HardwareGuide } from '@/components/HardwareGuide';
import { DeviceSettings } from '@/components/DeviceSettings';
import { ConfigDebug } from '@/components/ConfigDebug';
import { EnergyAlerts } from '@/components/EnergyAlerts';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { CostAnalysis } from '@/components/CostAnalysis';
import { CarbonFootprint } from '@/components/CarbonFootprint';
import { WeatherWidget } from '@/components/WeatherWidget';
import { BottomNav } from '@/components/BottomNav';
import { UserSettings } from '@/components/UserSettings';
import { IntroPage } from '@/components/IntroPage';
import { LoginPage } from '@/components/LoginPage';
import { AnalysisPage } from '@/components/AnalysisPage';
import { subscribeToLatestReading, subscribeToHistory, subscribeToControlState, setSystemState } from '@/services/energyService';
import { requestNotificationPermission, onMessageListener } from '@/services/notificationService';
import { EnergyReading, TimeRange, WeatherData } from '@/types';
import { LocationData } from '@/components/WeatherWidget';
import { cn } from '@/lib/utils';
import { firebaseConfig } from '@/firebase';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Logo } from '@/components/Logo';

// Page type for routing
type AppPage = 'intro' | 'login' | 'dashboard';

function App() {
  // Mobile sidebar state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Page routing state
  const [currentPage, setCurrentPage] = useState<AppPage>(() => {
    // If user was previously authenticated, skip intro
    const wasAuthenticated = localStorage.getItem('onxy_edge_authenticated');
    return wasAuthenticated ? 'dashboard' : 'intro';
  });

  // Clerk Auth State
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut: clerkSignOut } = useAuth();

  // Clerk timeout fallback — 3s for fast UX
  const [clerkTimedOut, setClerkTimedOut] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isUserLoaded) {
        console.warn('⚠️ Clerk failed to load in 3s — switching to guest mode');
        setClerkTimedOut(true);
      }
    }, 3000);
    if (isUserLoaded) clearTimeout(timer);
    return () => clearTimeout(timer);
  }, [isUserLoaded]);

  // When user signs in successfully, go to dashboard and remember
  useEffect(() => {
    if (isUserLoaded && user) {
      setCurrentPage('dashboard');
      localStorage.setItem('onxy_edge_authenticated', 'true');
    }
  }, [isUserLoaded, user]);

  const [activeTab, setActiveTab] = useState('dashboard');
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [isExportingDashboard, setIsExportingDashboard] = useState(false);
  const relayCooldownRef = useRef(false);
  const [isOn, setIsOn] = useState(true);
  const [currentReading, setCurrentReading] = useState<EnergyReading | null>(null);
  const [history, setHistory] = useState<EnergyReading[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [useFirebase, setUseFirebase] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('onxy_edge_theme') || 'light');

  // Apply theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    localStorage.setItem('onxy_edge_theme', theme);
  }, [theme]);

  // Initialize Notifications
  useEffect(() => {
    if (useFirebase) {
      requestNotificationPermission();
      const unsubscribeMessage = onMessageListener();
      return () => {
        if (typeof unsubscribeMessage === 'function') unsubscribeMessage();
      };
    }
  }, [useFirebase]);

  // Hardware Integration State
  const [espIp, setEspIp] = useState<string>('');
  const [showHardwareGuide, setShowHardwareGuide] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [showPdfModal, setShowPdfModal] = useState(false);

  // Load settings
  useEffect(() => {
    const savedIp = localStorage.getItem('onxy_edge_esp_ip');
    if (savedIp) setEspIp(savedIp);
    const hasFirebase = !!firebaseConfig.apiKey;
    setUseFirebase(hasFirebase);
  }, []);

  // Weather State
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<LocationData>({
    name: 'Madurai',
    latitude: 9.9252,
    longitude: 78.1198
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [isSearchingWeather, setIsSearchingWeather] = useState(false);

  const fetchWeather = async (lat: number, lon: number) => {
    setLoadingWeather(true);
    setWeatherError(null);
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`
      );
      if (!response.ok) throw new Error('Failed to fetch weather data');
      const data = await response.json();
      setWeather({
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        windSpeed: data.current.wind_speed_10m,
        conditionCode: data.current.weather_code
      });
    } catch (err) {
      console.error(err);
      setWeatherError('Could not load weather data');
    } finally {
      setLoadingWeather(false);
    }
  };

  const handleWeatherSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearchingWeather(true);
    setWeatherError(null);
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=1&language=en&format=json`
      );
      if (!response.ok) throw new Error('Location search failed');
      const data = await response.json();
      if (!data.results || data.results.length === 0) {
        setWeatherError('Location not found');
        return;
      }
      const result = data.results[0];
      const newLocation = { name: result.name, latitude: result.latitude, longitude: result.longitude };
      setLocation(newLocation);
      setSearchQuery('');
      await fetchWeather(newLocation.latitude, newLocation.longitude);
    } catch (err) {
      console.error(err);
      setWeatherError('Search failed');
    } finally {
      setIsSearchingWeather(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setWeatherError('Geolocation is not supported by your browser');
      return;
    }
    setLoadingWeather(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ name: 'Current Location', latitude, longitude });
        await fetchWeather(latitude, longitude);
      },
      (err) => {
        console.error(err);
        setWeatherError('Unable to retrieve your location');
        setLoadingWeather(false);
      }
    );
  };

  // Initial fetch for weather
  useEffect(() => {
    fetchWeather(location.latitude, location.longitude);
  }, []);

  // Data Subscription — NOT gated on Clerk auth
  useEffect(() => {
    if (useFirebase) {
      const unsubscribeLatest = subscribeToLatestReading((reading) => {
        if (reading) {
          setCurrentReading(reading);
          setHistory(prev => {
            const newHistory = [...prev, reading];
            if (newHistory.length > 50000) return newHistory.slice(-50000);
            return newHistory;
          });
        }
      });

      const unsubscribeHistory = subscribeToHistory(500, (data) => {
        if (data.length > 0) setHistory(data);
      });

      const unsubscribeControl = subscribeToControlState((state) => {
        // Skip Firebase state updates during cooldown (after user toggle)
        if (!relayCooldownRef.current) {
          setIsOn(state);
        }
      });

      return () => {
        unsubscribeLatest();
        unsubscribeHistory();
        unsubscribeControl();
      };
    } else {
      setConnectionStatus('disconnected');
    }
  }, [useFirebase, isOn]);

  const togglePower = () => {
    const newState = !isOn;
    // Instant UI update (optimistic) + block incoming state for 4s
    setIsOn(newState);
    relayCooldownRef.current = true;
    setTimeout(() => { relayCooldownRef.current = false; }, 4000);

    if (useFirebase) {
      setSystemState(newState).catch((err) => {
        console.error("Firebase write failed — reverting", err);
        relayCooldownRef.current = false;
        setIsOn(!newState);
      });
    }
  };

  const handleLogout = async () => {
    // 1. Clear all localStorage
    localStorage.removeItem('onxy_edge_authenticated');
    localStorage.removeItem('onxy_edge_esp_ip');
    // Keep theme preference — user may want that preserved

    // 2. Reset all app state
    setCurrentReading(null);
    setHistory([]);
    setActiveTab('dashboard');
    setIsOn(true);
    setConnectionStatus('disconnected');
    setEspIp('');
    setShowHardwareGuide(false);
    setShowSettings(false);
    setShowAlerts(false);

    // 3. Sign out from Clerk (handle network failure gracefully)
    try {
      await clerkSignOut();
    } catch (err) {
      console.warn('⚠️ Clerk signOut failed (network issue?) — proceeding with local logout', err);
    }

    // 4. Navigate to intro page
    setCurrentPage('intro');
  };

  // ==================== PAGE ROUTING ====================

  // 1. INTRO PAGE
  if (currentPage === 'intro') {
    return (
      <IntroPage
        onGetStarted={() => setCurrentPage('login')}
        onLogin={() => setCurrentPage('login')}
      />
    );
  }

  // 2. LOGIN PAGE
  if (currentPage === 'login') {
    // If Clerk loaded and user is authenticated, redirect to dashboard
    if (isUserLoaded && user) {
      setCurrentPage('dashboard');
      return null;
    }
    return (
      <LoginPage
        onBack={() => setCurrentPage('intro')}
      />
    );
  }

  // 3. DASHBOARD — Loading state (only show briefly, max 3s)
  if (!isUserLoaded && !clerkTimedOut) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center flex-col gap-4">
        <div className="relative">
          <Logo className="w-16 h-16 drop-shadow-2xl animate-pulse" />
        </div>
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Connecting to ONXY EDGE...</p>
        <p className="text-slate-600 text-xs">This should take just a moment</p>
      </div>
    );
  }

  const userEmail = user?.primaryEmailAddress?.emailAddress || '';
  const userName = user?.fullName || user?.firstName || (userEmail ? userEmail.split('@')[0] : 'Guest User');

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  // Dashboard content
  const renderDashboard = () => (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
      }}
      className="space-y-6"
    >
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setShowPdfModal(true)}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-95 shadow-sm"
        >
          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Export PDF
        </button>
      </div>

      <div ref={dashboardRef} className="space-y-3 sm:space-y-4 md:space-y-6">
        {/* Metric Cards — 2 cols on mobile, 3 on md, 5 on lg */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4">
          <motion.div variants={itemVariants}>
            <NewMetricCard
              label="Voltage"
              value={currentReading?.voltage.toFixed(1) || "0.0"}
              unit="V"
              icon={Activity}
              color="text-blue-500"
              bgColor="bg-blue-50 dark:bg-blue-900/20"
              progress={((currentReading?.voltage || 0) / 240) * 100}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <NewMetricCard
              label="Current"
              value={currentReading?.current.toFixed(2) || "0.00"}
              unit="A"
              icon={Zap}
              color="text-purple-500"
              bgColor="bg-purple-50 dark:bg-purple-900/20"
              progress={((currentReading?.current || 0) / 15) * 100}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <NewMetricCard
              label="Power"
              value={currentReading?.power.toFixed(1) || "0.0"}
              unit="W"
              icon={Battery}
              color="text-amber-500"
              bgColor="bg-amber-50 dark:bg-amber-900/20"
              progress={((currentReading?.power || 0) / 3000) * 100}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <NewMetricCard
              label="Energy"
              value={currentReading?.energy.toFixed(3) || "0.000"}
              unit="kWh"
              icon={Clock}
              color="text-emerald-500"
              bgColor="bg-emerald-50 dark:bg-emerald-900/20"
            />
          </motion.div>

          {/* Relay Card — responsive */}
          <motion.div variants={itemVariants} className="col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-1 bg-white dark:bg-slate-900/40 p-3 sm:p-4 md:p-5 rounded-2xl sm:rounded-[20px] border border-slate-100/80 dark:border-slate-800/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] backdrop-blur-xl flex flex-col justify-between transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">Relay Status</p>
                <h3 className={cn("text-lg sm:text-xl md:text-2xl font-bold tracking-tight mt-0.5 sm:mt-1", isOn ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400")}>
                  {isOn ? "ON" : "OFF"}
                </h3>
              </div>
              <div className={cn("w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center transition-colors", isOn ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-rose-50 dark:bg-rose-900/20")}>
                <Power className={cn("w-4 h-4 sm:w-5 sm:h-5", isOn ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400")} />
              </div>
            </div>
            <button
              onClick={togglePower}
              disabled={isConnecting}
              className={cn(
                "w-full py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all active:scale-[0.97] mt-2 sm:mt-4",
                isOn
                  ? "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40"
                  : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
              )}
            >
              {isConnecting ? "Syncing..." : isOn ? "Turn Off" : "Turn On"}
            </button>
          </motion.div>
        </div>

        {/* Row 2: Cost, Carbon, Weather — stacks on mobile, 3-col on md+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          <motion.div variants={itemVariants} className="h-full min-h-[240px] sm:min-h-[280px] md:min-h-[300px]">
            <CostAnalysis
              history={history}
              currentPower={currentReading?.power || 0}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="h-full min-h-[240px] sm:min-h-[280px] md:min-h-[300px]">
            <CarbonFootprint
              totalEnergy={currentReading?.energy || 0}
              realtimeCarbon={currentReading?.carbonFootprint || 0}
              currentPower={currentReading?.power || 0}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="h-full min-h-[240px] sm:min-h-[280px] md:min-h-[300px] sm:col-span-2 md:col-span-1">
            <WeatherWidget
              weather={weather}
              location={location}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              onSearch={handleWeatherSearch}
              onUseCurrentLocation={handleUseCurrentLocation}
              onRefresh={() => fetchWeather(location.latitude, location.longitude)}
              loading={loadingWeather}
              isSearching={isSearchingWeather}
              error={weatherError}
            />
          </motion.div>
        </div>

        {/* Row 3: AI Insights — full width */}
        <motion.div variants={itemVariants} className="w-full">
          <AIInsights currentReading={currentReading} history={history} weather={weather} />
        </motion.div>
      </div>
    </motion.div >
  );

  // Layout wrapper
  const renderLayout = (content: React.ReactNode, onLogoutFn: () => void, email: string, name: string, banner?: React.ReactNode) => (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 transition-colors duration-300">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={onLogoutFn}
        userEmail={email}
        userName={name}
        onOpenDeviceSettings={() => setShowSettings(true)}
        onOpenHardwareGuide={() => setShowHardwareGuide(true)}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50/50 dark:bg-[#0a0f1c]">
        <TopBar userEmail={email} userName={name} activeTab={activeTab} onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 xl:p-8 space-y-4 sm:space-y-6 pb-20 lg:pb-6 xl:pb-8">
          {banner}
          {content}
        </main>
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} onMenuClick={() => setIsMobileMenuOpen(true)} />
      <EnergyChatbot currentReading={currentReading} history={history} />
      <HardwareGuide isOpen={showHardwareGuide} onClose={() => setShowHardwareGuide(false)} />
      <DeviceSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={(ip) => { setEspIp(ip); localStorage.setItem('onxy_edge_esp_ip', ip); }}
        currentIp={espIp}
      />
      <EnergyAlerts isOpen={showAlerts} onClose={() => setShowAlerts(false)} currentReading={currentReading} />
      <ExportPDFModal isOpen={showPdfModal} onClose={() => setShowPdfModal(false)} history={history} userName={userName} />
      <ConfigDebug />
    </div>
  );

  // Guest mode: Clerk timed out
  if (clerkTimedOut && !user) {
    const guestBanner = (
      <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 text-sm rounded-xl p-3 flex items-center gap-2">
        <span>⚠️</span>
        <span>Authentication service unavailable. Showing live data in guest mode.</span>
      </div>
    );
    return renderLayout(renderDashboard(), handleLogout, '', 'Guest', guestBanner);
  }

  // Not authenticated — show login page instead of Clerk redirect
  if (!user) {
    return (
      <LoginPage onBack={() => setCurrentPage('intro')} />
    );
  }

  // Authenticated dashboard
  return renderLayout(
    <>
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'analysis' && (
        <AnalysisPage
          history={history}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          onExportPDF={() => setShowPdfModal(true)}
        />
      )}
      {activeTab === 'chatbot' && (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-lg mx-auto">
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">🤖</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">AI Assistant</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Use the floating chatbot widget in the bottom right corner to interact with the AI assistant from any page.
          </p>
        </div>
      )}
      {activeTab === 'weather' && (
        <div className="max-w-3xl mx-auto h-[60vh]">
          <WeatherWidget
            weather={weather}
            location={location}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onSearch={handleWeatherSearch}
            onUseCurrentLocation={handleUseCurrentLocation}
            onRefresh={() => fetchWeather(location.latitude, location.longitude)}
            loading={loadingWeather}
            isSearching={isSearchingWeather}
            error={weatherError}
          />
        </div>
      )}
      {activeTab === 'carbon' && (
        <div className="max-w-3xl mx-auto h-[60vh]">
          <CarbonFootprint
            totalEnergy={currentReading?.energy || 0}
            realtimeCarbon={currentReading?.carbonFootprint || 0}
            currentPower={currentReading?.power || 0}
          />
        </div>
      )}
      {activeTab === 'reports' && (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-lg mx-auto">
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">📊</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">Export Reports</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Navigate to the "System Dynamics" tab to view detailed metrics and export reports to PDF, CSV, or JSON.
          </p>
          <button onClick={() => setActiveTab('analysis')} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-colors">
            Go to System Dynamics
          </button>
        </div>
      )}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Energy Alerts</h2>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
            <p className="text-slate-500 dark:text-slate-400 mb-4">Configure your energy usage alerts here.</p>
            <button
              onClick={() => setShowAlerts(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Configure Alerts
            </button>
          </div>
        </div>
      )}
      {activeTab === 'settings' && (
        <UserSettings
          userEmail={userEmail}
          userName={userName}
          onLogout={handleLogout}
          history={history}
          theme={theme}
          onThemeChange={setTheme}
        />
      )}
    </>,
    handleLogout,
    userEmail,
    userName
  );
}

export default App;
