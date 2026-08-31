import React from "react";
import { useStudioStore } from "../../lib/store/studio-store";
import { ShieldCheck, AlertCircle, TrendingUp, TrendingDown, Droplets, Banknote } from "lucide-react";
import { getRiskColor } from "../../lib/data/cgwb-districts";

export const QuickStatsBar: React.FC = () => {
  const { getCurrentDistrict, getPrediction, getPolicyEvaluation } = useStudioStore();
  const district = getCurrentDistrict();
  const prediction = getPrediction();
  const policy = getPolicyEvaluation();
  const riskColor = getRiskColor(prediction.riskLevel);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* 1. Water Table Depth */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-xl shadow-xl hover:border-cyan-500/30 transition-all duration-200 group">
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>Projected Water Table Depth</span>
          <div className="h-8 w-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
            <Droplets className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-mono text-3xl font-bold tracking-tight text-white">
            {prediction.predictedWaterLevelM}
          </span>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">mbgl</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          {prediction.waterLevelDeltaM > 0 ? (
            <span className="flex items-center text-red-400 font-semibold">
              <TrendingDown className="h-3.5 w-3.5 mr-1" /> +{prediction.waterLevelDeltaM}m drop vs baseline
            </span>
          ) : prediction.waterLevelDeltaM < 0 ? (
            <span className="flex items-center text-emerald-400 font-semibold">
              <TrendingUp className="h-3.5 w-3.5 mr-1" /> {prediction.waterLevelDeltaM}m rebound vs baseline
            </span>
          ) : (
            <span className="text-slate-400 font-medium">Stable at {district.baselineWaterLevelM} mbgl baseline</span>
          )}
        </div>
      </div>

      {/* 2. Extraction Stage */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-xl shadow-xl hover:border-slate-700 transition-all duration-200 group">
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>Stage of Groundwater Extraction</span>
          <div className="h-8 w-8 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: `${riskColor}18` }}>
            <AlertCircle className="h-4 w-4" style={{ color: riskColor }} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-mono text-3xl font-bold tracking-tight" style={{ color: riskColor }}>
            {prediction.predictedExtractionPct}%
          </span>
        </div>
        <div className="mt-2">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider"
            style={{
              backgroundColor: `${riskColor}18`,
              color: riskColor,
              border: `1px solid ${riskColor}38`,
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: riskColor }} />
            {prediction.riskLevel}
          </span>
        </div>
      </div>

      {/* 3. Potential Daily Water Recovery */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-xl shadow-xl hover:border-emerald-500/30 transition-all duration-200 group">
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>Potential Net Daily Recovery</span>
          <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
            <ShieldCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-mono text-3xl font-bold tracking-tight text-emerald-400">
            {policy.totalWaterSavingsMld}
          </span>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">MLD / day</span>
        </div>
        <p className="mt-2 text-xs text-slate-400 font-medium">
          Across <span className="text-slate-200 font-semibold">{policy.directives.length}</span> active policy mandates
        </p>
      </div>

      {/* 4. Required Capex */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-xl shadow-xl hover:border-purple-500/30 transition-all duration-200 group">
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>Est. Infrastructure CAPEX</span>
          <div className="h-8 w-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-colors">
            <Banknote className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-mono text-3xl font-bold tracking-tight text-purple-300">
            ₹{policy.totalCapexCrores}
          </span>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Crores</span>
        </div>
        <p className="mt-2 text-xs text-slate-400 font-medium">
          Recharge Pits & Dual STP Reticulation
        </p>
      </div>
    </div>
  );
};
