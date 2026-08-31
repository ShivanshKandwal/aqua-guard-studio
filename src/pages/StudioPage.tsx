import React from "react";
import { InteractiveNcrMap } from "../components/map/InteractiveNcrMap";
import { MetricsControlDeck } from "../components/studio/MetricsControlDeck";
import { ForecastChart } from "../components/studio/ForecastChart";
import { QuickStatsBar } from "../components/studio/QuickStatsBar";
import { useStudioStore } from "../lib/store/studio-store";
import { ArrowRight, ShieldAlert, Sparkles, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export const StudioPage: React.FC = () => {
  const { getCurrentDistrict, getPrediction, getPolicyEvaluation } = useStudioStore();
  const district = getCurrentDistrict();
  const prediction = getPrediction();
  const policy = getPolicyEvaluation();

  return (
    <div className="space-y-8">
      {/* Top Banner / District Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 rounded-3xl border border-slate-800/80 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-[#0c1328]/90 p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-bold text-cyan-300 border border-cyan-500/30 shadow-sm">
              <MapPin className="h-3.5 w-3.5" /> {district.name}, {district.state}
            </span>
            <span className="rounded-full bg-slate-800/80 px-3 py-1 text-xs text-slate-300 border border-slate-700/60 font-medium">
              Aquifer: {district.aquiferType}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mt-2.5">
            Groundwater Stress Studio & Simulation Cockpit
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl mt-1.5 leading-relaxed">
            Manipulate meteorological deviations, groundwater draft rates, and artificial recharge variables to simulate sub-surface aquifer depths and trigger statutory CGWB governance policies in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <Link
            to="/policies"
            className="flex items-center gap-2 rounded-2xl border border-cyan-500/40 bg-cyan-500/15 hover:bg-cyan-500/25 px-4 py-2.5 text-xs sm:text-sm font-bold text-cyan-200 transition-all shadow-lg shadow-cyan-500/10"
          >
            <ShieldAlert className="h-4 w-4 text-cyan-400" /> Active Policies ({policy.directives.length})
          </Link>
          <Link
            to="/assistant"
            className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/90 hover:bg-slate-700 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 transition-all shadow-md"
          >
            <Sparkles className="h-4 w-4 text-cyan-400" /> Ask AI Advisor
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <QuickStatsBar />

      {/* Main Interactive Grid: Map + Sliders */}
      <div className="grid grid-cols-1 gap-7 lg:grid-cols-12">
        {/* Left / Control Deck */}
        <div className="lg:col-span-4 flex flex-col">
          <MetricsControlDeck />
        </div>

        {/* Right / Interactive Map */}
        <div className="lg:col-span-8 flex flex-col min-h-[520px]">
          <InteractiveNcrMap />
        </div>
      </div>

      {/* Bottom Projection Chart */}
      <div className="w-full">
        <ForecastChart />
      </div>
    </div>
  );
};
