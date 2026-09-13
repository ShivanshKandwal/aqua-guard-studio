import React from "react";
import { useStudioStore } from "../../lib/store/studio-store";
import { ShieldCheck, AlertCircle, TrendingUp, TrendingDown, Droplets, Banknote } from "lucide-react";
import { getRiskColor } from "../../lib/data/cgwb-districts";

export const QuickStatsBar: React.FC<{ orientation?: "horizontal" | "vertical" }> = ({
  orientation = "vertical",
}) => {
  const { getCurrentDistrict, getPrediction, getPolicyEvaluation } = useStudioStore();
  const district = getCurrentDistrict();
  const prediction = getPrediction();
  const policy = getPolicyEvaluation();
  const riskColor = getRiskColor(prediction.riskLevel);

  const isVertical = orientation === "vertical";

  return (
    <div
      className={
        isVertical
          ? "grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-col lg:justify-between h-full gap-2.5"
          : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      }
    >
      {/* 1. Water Table Depth */}
      <div className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-3.5 backdrop-blur-xl shadow-lg hover:border-cyan-400/50 hover:shadow-cyan-500/10 transition-all flex flex-col justify-between flex-1 group">
        <div className="flex items-center justify-between text-slate-300 text-xs font-semibold">
          <span className="truncate">Water Table Depth</span>
          <div className="h-7 w-7 rounded-lg bg-cyan-500/15 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/25 transition-all shrink-0">
            <Droplets className="h-4 w-4" />
          </div>
        </div>
        <div className="my-1.5 flex items-baseline gap-2">
          <span className="font-mono text-2xl xl:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
            {prediction.predictedWaterLevelM}
          </span>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">mbgl</span>
        </div>
        <div className="flex items-center text-xs">
          {prediction.waterLevelDeltaM > 0 ? (
            <span className="flex items-center text-red-400 font-bold text-[11px]">
              <TrendingDown className="h-3.5 w-3.5 mr-1 shrink-0" /> +{prediction.waterLevelDeltaM}m drop vs baseline
            </span>
          ) : prediction.waterLevelDeltaM < 0 ? (
            <span className="flex items-center text-emerald-400 font-bold text-[11px]">
              <TrendingUp className="h-3.5 w-3.5 mr-1 shrink-0" /> {prediction.waterLevelDeltaM}m rebound vs baseline
            </span>
          ) : (
            <span className="text-slate-300 font-medium text-[11px] truncate">Stable at {district.baselineWaterLevelM}m</span>
          )}
        </div>
      </div>

      {/* 2. Extraction Stage */}
      <div className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-3.5 backdrop-blur-xl shadow-lg hover:border-slate-600 transition-all flex flex-col justify-between flex-1 group">
        <div className="flex items-center justify-between text-slate-300 text-xs font-semibold">
          <span className="truncate">Stage of Extraction</span>
          <div
            className="h-7 w-7 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all shrink-0"
            style={{ backgroundColor: `${riskColor}22` }}
          >
            <AlertCircle className="h-4 w-4" style={{ color: riskColor }} />
          </div>
        </div>
        <div className="my-1.5 flex items-baseline gap-2">
          <span className="font-mono text-2xl xl:text-3xl font-extrabold tracking-tight" style={{ color: riskColor }}>
            {prediction.predictedExtractionPct}%
          </span>
        </div>
        <div>
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider"
            style={{
              backgroundColor: `${riskColor}22`,
              color: riskColor,
              border: `1px solid ${riskColor}50`,
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: riskColor }} />
            {prediction.riskLevel}
          </span>
        </div>
      </div>

      {/* 3. Potential Daily Water Recovery */}
      <div className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-3.5 backdrop-blur-xl shadow-lg hover:border-emerald-400/50 hover:shadow-emerald-500/10 transition-all flex flex-col justify-between flex-1 group">
        <div className="flex items-center justify-between text-slate-300 text-xs font-semibold">
          <span className="truncate">Potential Net Recovery</span>
          <div className="h-7 w-7 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/25 transition-all shrink-0">
            <ShieldCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="my-1.5 flex items-baseline gap-2">
          <span className="font-mono text-2xl xl:text-3xl font-extrabold tracking-tight text-emerald-400 drop-shadow-sm">
            {policy.projectedRecoveryMld}
          </span>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">MLD / DAY</span>
        </div>
        <p className="text-[11px] text-slate-300 font-medium truncate">
          Across <span className="text-emerald-300 font-bold">{policy.directives.length} active policies</span>
        </p>
      </div>

      {/* 4. Infrastructure CAPEX Required */}
      <div className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-3.5 backdrop-blur-xl shadow-lg hover:border-purple-400/50 hover:shadow-purple-500/10 transition-all flex flex-col justify-between flex-1 group">
        <div className="flex items-center justify-between text-slate-300 text-xs font-semibold">
          <span className="truncate">Est. Infrastructure CAPEX</span>
          <div className="h-7 w-7 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:bg-purple-500/25 transition-all shrink-0">
            <Banknote className="h-4 w-4" />
          </div>
        </div>
        <div className="my-1.5 flex items-baseline gap-2">
          <span className="font-mono text-2xl xl:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
            ₹{policy.estimatedCapexCrores}
          </span>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">CRORES</span>
        </div>
        <p className="text-[11px] text-slate-300 font-medium truncate">
          Recharge Pits & Dual STP Reticulation
        </p>
      </div>
    </div>
  );
};