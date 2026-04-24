import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Thermometer, Droplets, AlertTriangle, ShieldCheck, TrendingUp, Info } from 'lucide-react';
import { ClimateAnalysis } from '../services/geminiService';
import { cn, formatTemp } from '../lib/utils';

interface DashboardProps {
  selectedRegion: string | null;
  regionData: any;
  analysis: ClimateAnalysis | null;
  isLoading: boolean;
  viewMode: "wbgt" | "rain";
}

export const ClimateDashboard: React.FC<DashboardProps> = ({
  selectedRegion,
  regionData,
  analysis,
  isLoading,
  viewMode
}) => {
  return (
    <div className="h-full flex flex-col gap-6 p-6 bg-slate-900/50 backdrop-blur-xl border-l border-white/10 overflow-y-auto custom-scrollbar">
      
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          {selectedRegion || 'Global Overview'}
        </h1>
        <p className="text-sm text-slate-400 font-medium">
          {selectedRegion ? 'Regional Climate Intelligence' : 'Select a region for deep analysis'}
        </p>
      </header>

      {selectedRegion && regionData && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                regionData.windSpeed ? "bg-emerald-500 animate-pulse" : "bg-slate-500"
              )} />
              <span className="text-[10px] font-mono uppercase tracking-tighter text-slate-500">
                {regionData.windSpeed ? "Real-time Satellite Data" : "Simulated Climate Data"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">

            {/* Temperature */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col gap-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Thermometer size={16} />
                <span className="text-xs font-mono uppercase">Temperature</span>
              </div>
              <span className="text-2xl font-light text-white">
                {formatTemp(regionData.temp)}
              </span>
            </div>

            {/* Humidity */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col gap-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Droplets size={16} />
                <span className="text-xs font-mono uppercase">Humidity</span>
              </div>
              <span className="text-2xl font-light text-white">
                {regionData.humidity}%
              </span>
            </div>

            {/* WBGT / Rainfall (Dynamic) */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col gap-2">
              <div className="flex items-center gap-2 text-slate-400">
                {viewMode === "wbgt" ? (
                  <AlertTriangle size={16} />
                ) : (
                  <Droplets size={16} />
                )}
                <span className="text-xs font-mono uppercase">
                  {viewMode === "wbgt" ? "WBGT" : "Rainfall"}
                </span>
              </div>

              <span className="text-2xl font-light text-white">
                {viewMode === "wbgt"
                  ? regionData.wbgt
                    ? formatTemp(regionData.wbgt)
                    : "--"
                  : regionData.rainfall
                    ? `${Math.round(regionData.rainfall)} mm`
                    : "--"}
              </span>
            </div>

          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-500"
          >
            <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-xs font-mono uppercase tracking-widest">
              Generating AI Insights...
            </p>
          </motion.div>
        ) : analysis ? (
          <motion.div 
            key="analysis"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex flex-col gap-6"
          >

            {/* Risk Score */}
            <div className="relative h-32 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/10 p-6 flex items-center justify-between overflow-hidden">
              <div className="z-10">
                <h3 className="text-xs font-mono uppercase text-slate-400 mb-1">
                  Climate Risk Score
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className={cn(
                    "text-5xl font-bold",
                    analysis.riskScore > 70
                      ? "text-red-400"
                      : analysis.riskScore > 40
                        ? "text-orange-400"
                        : "text-emerald-400"
                  )}>
                    {analysis.riskScore}
                  </span>
                  <span className="text-slate-500 font-mono">/100</span>
                </div>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 flex items-center justify-center">
                <AlertTriangle
                  size={48}
                  className={cn(
                    "opacity-20",
                    analysis.riskScore > 70
                      ? "text-red-400"
                      : "text-slate-400"
                  )}
                />
              </div>
            </div>

            {/* Threats */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-orange-400" />
                <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400">
                  Primary Threats
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.primaryThreats.map((threat, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-red-400/10 border border-red-400/20 text-red-400 text-[11px] rounded-full font-medium"
                  >
                    {threat}
                  </span>
                ))}
              </div>
            </section>

            {/* Future Projection */}
            <section className="bg-white/5 border border-white/10 p-5 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-blue-400" />
                <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400">
                  10-Year Projection
                </h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed italic">
                "{analysis.futureProjection}"
              </p>
            </section>

            {/* Mitigation */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={16} className="text-emerald-400" />
                <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400">
                  Mitigation Strategies
                </h3>
              </div>
              <ul className="space-y-2">
                {analysis.mitigationStrategies.map((strategy, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-400">
                    <span className="text-emerald-500 font-mono shrink-0">
                      0{i + 1}
                    </span>
                    {strategy}
                  </li>
                ))}
              </ul>
            </section>

            <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase">
              <span>Confidence: {analysis.confidenceLevel}</span>
              <span>AI Engine: Gemini 3 Flash</span>
            </div>

          </motion.div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-600 text-center px-6">
            <Info size={40} strokeWidth={1} />
            <p className="text-sm">
              Select a country on the globe to initiate real-time climate risk analysis and AI projections.
            </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};