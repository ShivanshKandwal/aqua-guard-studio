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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-3xl border border-slate-700/80 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-[#0c1a3d]/95 p-6 md:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[480px] h-[480px] bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 rounded-xl bg-cyan-500/20 px-3.5 py-1.5 text-sm font-bold text-cyan-200 border border-cyan-400/40 shadow-sm">
              <MapPin className="h-4 w-4 text-cyan-400" /> {district.name}, {district.state}
            </span>
            <span className="rounded-xl bg-slate-800/90 px-3.5 py-1.5 text-sm text-slate-200 border border-slate-700/80 font-semibold">
              Aquifer: {district.aquiferType}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mt-3 drop-shadow-sm">
            Groundwater Stress Studio & Simulation Cockpit
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-4xl mt-2 leading-relaxed font-normal">
            Manipulate meteorological deviations, groundwater draft rates, and artificial recharge variables to simulate sub-surface aquifer depths and trigger statutory CGWB governance policies in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0 flex-wrap">
          <Link
            to="/policies"
            className="flex items-center gap-2 rounded-2xl border border-cyan-400/50 bg-cyan-500/20 hover:bg-cyan-500/30 px-5 py-3 text-sm font-bold text-cyan-100 transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:scale-102"
          >
            <ShieldAlert className="h-4 w-4 text-cyan-300" /> Active Policies ({policy.directives.length})
          </Link>
          <Link
            to="/assistant"
            className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/90 hover:bg-slate-700/90 px-5 py-3 text-sm font-bold text-slate-100 transition-all duration-200 shadow-md hover:scale-102"
          >
            <Sparkles className="h-4 w-4 text-cyan-400" /> Ask AI Advisor
          </Link>
        </div>
      </div>

      {/* KPI Cards with Enlarged Typography */}
      <QuickStatsBar />

      {/* Main Interactive Grid: Map + Sliders */}
      <div className="grid grid-cols-1 gap-7 lg:grid-cols-12">
        {/* Left / Control Deck */}
        <div className="lg:col-span-4 flex flex-col">
          <MetricsControlDeck />
        </div>

        {/* Right / Interactive Map */}
        <div className="lg:col-span-8 flex flex-col min-h-[540px]">
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