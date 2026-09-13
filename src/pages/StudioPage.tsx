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
    <div className="space-y-3.5">
      {/* Sleek High-Density Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-700/80 bg-gradient-to-r from-slate-900/95 via-slate-900/85 to-[#0c1a3d]/95 px-4 py-2.5 backdrop-blur-xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <span className="flex items-center gap-1.5 rounded-lg bg-cyan-500/20 px-2.5 py-1 text-xs font-bold text-cyan-200 border border-cyan-400/40 shadow-sm">
            <MapPin className="h-3.5 w-3.5 text-cyan-400" /> {district.name}, {district.state}
          </span>
          <span className="rounded-lg bg-slate-800/90 px-2.5 py-1 text-xs text-slate-300 border border-slate-700/80 font-medium">
            Aquifer: {district.aquiferType}
          </span>
          <div className="h-4 w-[1px] bg-slate-700 hidden md:block" />
          <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white">
            Groundwater Stress Studio & Simulation Cockpit
          </h1>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0">
          <Link
            to="/policies"
            className="flex items-center gap-1.5 rounded-xl border border-cyan-400/40 bg-cyan-500/20 hover:bg-cyan-500/30 px-3 py-1.5 text-xs font-bold text-cyan-100 transition-all shadow-sm"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-cyan-300" /> Active Policies ({policy.directives.length})
          </Link>
          <Link
            to="/assistant"
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/90 hover:bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-100 transition-all shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" /> Ask AI Advisor
          </Link>
        </div>
      </div>

      {/* Main Interactive Grid: Vertical Stats (Left) + Sliders (Center) + Map (Right, Smaller) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Column 1: Top Elements (KPI Metrics) Stacked Vertically on Left */}
        <div className="lg:col-span-3 flex flex-col h-[415px]">
          <QuickStatsBar orientation="vertical" />
        </div>

        {/* Column 2: Simulation Control Deck */}
        <div className="lg:col-span-4 flex flex-col h-[415px]">
          <MetricsControlDeck />
        </div>

        {/* Column 3: Interactive NCR Map (A little smaller, perfectly aligned) */}
        <div className="lg:col-span-5 flex flex-col h-[415px]">
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