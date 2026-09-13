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
      <div className="rounded-3xl border border-slate-700/80 bg-slate-900/60 p-6 backdrop-blur-xl shadow-2xl hover:border-cyan-400/50 hover:shadow-cyan-500/10 transition-all duration-300 group">
        <div className="flex items-center justify-between text-slate-300 text-sm font-semibold">
          <span>Projected Water Table Depth</span>
          <div className="h-9 w-9 rounded-2xl bg-cyan-500/15 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/25 transition-all">
            <Droplets className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2.5">
          <span className="font-mono text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
            {prediction.predictedWaterLevelM}
          </span>
          <span className="text-sm text-slate-400 font-bold uppercase tracking-wider">mbgl</span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-sm">
          {prediction.waterLevelDeltaM > 0 ? (
            <span className="flex items-center text-red-400 font-bold">
              <TrendingDown className="h-4 w-4 mr-1" /> +{prediction.waterLevelDeltaM}m drop vs baseline
            </span>
          ) : prediction.waterLevelDeltaM < 0 ? (
            <span className="flex items-center text-emerald-400 font-bold">
              <TrendingUp className="h-4 w-4 mr-1" /> {prediction.waterLevelDeltaM}m rebound vs baseline
            </span>
          ) : (
            <span className="text-slate-300 font-medium">Stable at {district.baselineWaterLevelM} mbgl baseline</span>
          )}
        </div>
      </div>

      {/* 2. Extraction Stage */}
      <div className="rounded-3xl border border-slate-700/80 bg-slate-900/60 p-6 backdrop-blur-xl shadow-2xl hover:border-slate-600 transition-all duration-300 group">
        <div className="flex items-center justify-between text-slate-300 text-sm font-semibold">
          <span>Stage of Groundwater Extraction</span>
          <div className="h-9 w-9 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all" style={{ backgroundColor: `${riskColor}22` }}>
            <AlertCircle className="h-5 w-5" style={{ color: riskColor }} />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2.5">
          <span className="font-mono text-4xl font-extrabold tracking-tight" style={{ color: riskColor }}>
            {prediction.predictedExtractionPct}%
          </span>
        </div>
        <div className="mt-3">
          <span
            className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider shadow-sm"
            style={{
              backgroundColor: `${riskColor}22`,
              color: riskColor,
              border: `1px solid ${riskColor}50`,
            }}
          >
            <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: riskColor }} />
            {prediction.riskLevel}
          </span>
        </div>
      </div>

      {/* 3. Potential Daily Water Recovery */}
      <div className="rounded-3xl border border-slate-700/80 bg-slate-900/60 p-6 backdrop-blur-xl shadow-2xl hover:border-emerald-400/50 hover:shadow-emerald-500/10 transition-all duration-300 group">
        <div className="flex items-center justify-between text-slate-300 text-sm font-semibold">
          <span>Potential Net Daily Recovery</span>
          <div className="h-9 w-9 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/25 transition-all">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2.5">
          <span className="font-mono text-4xl font-extrabold tracking-tight text-emerald-400 drop-shadow-sm">
            {policy.projectedRecoveryMld}
          </span>
          <span className="text-sm text-slate-400 font-bold uppercase tracking-wider">MLD / DAY</span>
        </div>
        <p className="mt-3 text-sm text-slate-300 font-medium">
          Across <span className="text-emerald-300 font-bold">{policy.directives.length} active policy mandates</span>
        </p>
      </div>

      {/* 4. Infrastructure CAPEX Required */}
      <div className="rounded-3xl border border-slate-700/80 bg-slate-900/60 p-6 backdrop-blur-xl shadow-2xl hover:border-purple-400/50 hover:shadow-purple-500/10 transition-all duration-300 group">
        <div className="flex items-center justify-between text-slate-300 text-sm font-semibold">
          <span>Est. Infrastructure CAPEX</span>
          <div className="h-9 w-9 rounded-2xl bg-purple-500/15 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:bg-purple-500/25 transition-all">
            <Banknote className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2.5">
          <span className="font-mono text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
            ₹{policy.estimatedCapexCrores}
          </span>
          <span className="text-sm text-slate-400 font-bold uppercase tracking-wider">CRORES</span>
        </div>
        <p className="mt-3 text-sm text-slate-300 font-medium truncate">
          Recharge Pits & Dual STP Reticulation
        </p>
      </div>
    </div>
  );
};