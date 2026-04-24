import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WorldMap } from './components/WorldMap';
import { ClimateDashboard } from './components/ClimateDashboard';
import { TimeMachine } from './components/TimeMachine';
import { analyzeClimateData, ClimateAnalysis, getClimateInsights } from './services/geminiService';
import { getWeatherData } from './services/weatherService';
import { Activity, Globe, Zap, ShieldAlert } from 'lucide-react';
import { ReportModal } from "./components/ReportModal";
import { MessageCircle } from "lucide-react";

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-3">
    <div className={`w-3 h-3 rounded-full ${color}`} />
    <span className="text-[10px] font-mono text-slate-400">{label}</span>
  </div>
);

export default function App() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [regionData, setRegionData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<ClimateAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timePeriod, setTimePeriod] = useState<'past' | 'present' | 'future'>('present');
  const [globalInsight, setGlobalInsight] = useState<string>('Initializing global climate monitoring systems...');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [tempKey, setTempKey] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);

  // Safety check for local development
  const isApiKeyMissing = !process.env.GEMINI_API_KEY && !import.meta.env.VITE_GEMINI_API_KEY;

  const [viewMode, setViewMode] = useState<"wbgt" | "rain">("wbgt");

  useEffect(() => {
    if (isApiKeyMissing) {
      console.error("CRITICAL: Gemini API Key is missing. Please check your .env file.");
    }
  }, [isApiKeyMissing]);

  const saveKey = () => {
    if (tempKey) {
      localStorage.setItem('WEATHER_API_KEY_FALLBACK', tempKey);
      setKeyError(null);
      setShowKeyInput(false);
      window.location.reload();
    }
  };

  const resetKey = () => {
    localStorage.removeItem('WEATHER_API_KEY_FALLBACK');
    window.location.reload();
  };

const handleRegionSelect = async (region: string | null, data: any) => {

  // If ocean clicked → reset everything
  if (!region) {
    setSelectedRegion(null);
    setRegionData(null);
    setAnalysis(null);
    setIsLoading(false);
    return;
  }

  setSelectedRegion(region);
  setIsLoading(true);
  setKeyError(null);
  setAnalysis(null);

  let finalData = data;

  if (data?.lat && data?.lon) {
    try {
      const realTime = await getWeatherData(data.lat, data.lon);
      if (realTime) {
        finalData = { ...data, ...realTime };
      }
    } catch (error: any) {
      console.warn("Weather fetch failed, falling back to simulation:", error.message);

      if (error.message.includes("API Key")) {
        setKeyError(error.message);
      }
    }
  }

  setRegionData(finalData);

  try {
    console.log(`Initiating climate analysis for ${region}...`);
    const result = await analyzeClimateData(region, finalData.temp, finalData.humidity);
    setAnalysis(result);
  } catch (error) {
    console.error("Analysis failed", error);
  } finally {
    setIsLoading(false);
  }
};

const handleReportSubmit = (message: string) => {
  console.log("User Report:", message);

  // Later you can send to API here
  // await fetch("/api/report", { ... })

  alert("Report submitted successfully!");
};

  useEffect(() => {
    const fetchGlobalInsight = async () => {
      try {
        const insight = await getClimateInsights({ avgTemp: 15.8, co2Level: 421, seaLevelRise: 3.4 });
        setGlobalInsight(insight);
      } catch (err) {
        console.error("Insight error:", err);
        setGlobalInsight("Monitoring global climate patterns. System active and analyzing thermal anomalies.");
      }
    };
    fetchGlobalInsight();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-emerald-500/30">
      {isApiKeyMissing ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-[radial-gradient(circle_at_50%_50%,#064e3b_0%,#020617_100%)]">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-12 rounded-[2.5rem] max-w-2xl shadow-2xl">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
              <ShieldAlert className="text-emerald-400" size={40} />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Setup Required</h1>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              To run Climatica locally, you must provide a Gemini API Key in your <code className="bg-white/10 px-2 py-1 rounded text-emerald-400">.env</code> file.
            </p>
            <div className="bg-black/40 p-6 rounded-2xl text-left font-mono text-sm mb-8 border border-white/5">
              <p className="text-emerald-500 mb-2"># Create a file named .env and add:</p>
              <p className="text-white">GEMINI_API_KEY="your_key_here"</p>
            </div>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-8 py-4 rounded-2xl transition-all hover:scale-105 active:scale-95"
            >
              Get API Key <Globe size={18} />
            </a>
          </div>
        </div>
      ) : (
        <div className="flex h-screen w-full bg-[#050505] text-slate-200 font-sans overflow-hidden">
      {/* Sidebar Navigation (Minimal) */}
      <aside className="w-20 border-r border-white/5 flex flex-col items-center py-8 gap-8 bg-black/20">
        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Globe className="text-black" size={24} />
        </div>
        <nav className="flex flex-col gap-6">
          <button className="p-3 text-emerald-400 bg-white/5 rounded-xl border border-white/10"><Activity size={20} /></button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col">
        {/* Top Bar */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-white/5">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Climatica <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">v2.5 PRO</span>
            </h1>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Global Intelligence Network</p>
          </div>
          
          <div className="flex-1 max-w-xl mx-12">
            <div className="bg-white/5 border border-white/10 rounded-full px-4 py-2 flex items-center gap-3 overflow-hidden">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <p className="text-xs text-slate-400 truncate italic">
                {globalInsight}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowKeyInput(true)}
              className="text-right hover:opacity-80 transition-opacity cursor-pointer"
            >
              <p className="text-xs font-mono text-slate-400 uppercase">System Status</p>
              <p className="text-sm font-medium text-emerald-400">Operational</p>
            </button>
          </div>
        </header>

        {/* API Key Fallback Modal */}
        <AnimatePresence>
          {showKeyInput && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-md w-full shadow-2xl"
              >
                <h2 className="text-xl font-bold text-white mb-2">Connect Satellite Feed</h2>
                <p className="text-sm text-slate-400 mb-6">Paste your OpenWeatherMap API key below to enable real-time climate monitoring.</p>
                
                {keyError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-xs">
                    <ShieldAlert size={14} />
                    <span>{keyError}</span>
                  </div>
                )}

                <input 
                  type="password"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="Enter API Key..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white mb-4 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={saveKey}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-3 rounded-xl transition-colors"
                  >
                    Activate System
                  </button>
                  <div className="flex gap-3">
                    <button 
                      onClick={resetKey}
                      className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-3 rounded-xl transition-colors text-sm font-medium"
                    >
                      Reset Key
                    </button>
                    <button 
                      onClick={() => {
                        localStorage.removeItem('WEATHER_API_KEY_FALLBACK');
                        setKeyError(null);
                        setShowKeyInput(false);
                        window.location.reload();
                      }}
                      className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 py-3 rounded-xl transition-colors text-sm font-medium"
                    >
                      Demo Mode
                    </button>
                    <button 
                      onClick={() => setShowKeyInput(false)}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map View */}
        <div className="flex-1 p-8 relative">
          <WorldMap onRegionSelect={handleRegionSelect} timePeriod={timePeriod} viewMode={viewMode} setViewMode={setViewMode} />     
          {/* View Toggle */}
          <div className="absolute top-12 left-12 z-20">
          <button
            onClick={() => setViewMode(viewMode === "wbgt" ? "rain" : "wbgt")}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
            >
            {viewMode === "wbgt" ? "Show Rainfall" : "Show Heat"}
            </button>
          </div>     
          {/* Floating Time Machine Controls */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
            <TimeMachine currentPeriod={timePeriod} onPeriodChange={setTimePeriod} />
          </div>

{/* Legend */}
<div className="absolute top-12 right-12 bg-black/40 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex flex-col gap-3 w-52">

  <h4 className="text-[10px] font-mono uppercase text-slate-500 tracking-widest">
    {viewMode === "wbgt"
      ? "Thermal Heat Index (WBGT)"
      : "Rainfall Index (mm/year approx.)"}
  </h4>

  {viewMode === "wbgt" ? (
    <>
      <LegendItem color="bg-blue-500" label="Low Risk" />
      <LegendItem color="bg-yellow-500" label="Moderate" />
      <LegendItem color="bg-red-500" label="Extreme" />
    </>
  ) : (
    <>
      <LegendItem color="bg-white" label="< 70 mm" />
      <LegendItem color="bg-cyan-300" label="70 – 110 mm" />
      <LegendItem color="bg-green-400" label="110 – 145 mm" />
      <LegendItem color="bg-emerald-900" label="> 145 mm" />
    </>
  )}
</div>
        </div>

{/* Floating Report Button */}
<button
  onClick={() => setShowReport(true)}
  className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30 transition-all"
>
  <MessageCircle size={22} className="text-black" />
</button>        
      </main>

      {/* Right Intelligence Panel */}
      <aside className="w-[420px]">
        <ClimateDashboard 
          selectedRegion={selectedRegion} 
          regionData={regionData} 
          analysis={analysis}
          isLoading={isLoading}
          viewMode={viewMode}
        />
      </aside>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        onSubmit={handleReportSubmit}
      />

    </div>
  );
}