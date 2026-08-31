import React from "react";
import { useStudioStore } from "../../lib/store/studio-store";
import { Sliders, RefreshCw, CloudRain, Droplet, Building2, Factory, Sprout, Calendar, Sparkles } from "lucide-react";

export const MetricsControlDeck: React.FC = () => {
  const { params, setParam, resetParams, applyPreset, activeModelId, setActiveModelId } = useStudioStore();

  // Model recommendation advice based on forecast horizon
  const getHorizonRecommendation = (years: number) => {
    if (years <= 4) {
      return {
        modelId: "linreg-v1",
        label: "Linear Regression Recommended (Fast near-term slope baseline)",
        color: "text-amber-400 border-amber-800/60 bg-amber-950/30",
      };
    } else if (years <= 8) {
      return {
        modelId: "xgboost-v1",
        label: "XGBoost Recommended (Optimal non-linear threshold & extreme shocks)",
        color: "text-cyan-400 border-cyan-800/60 bg-cyan-950/30",
      };
    } else {
      return {
        modelId: "lstm-v1",
        label: "LSTM Neural Net Recommended (Superior multi-season hydrological lag & hysteresis)",
        color: "text-purple-400 border-purple-800/60 bg-purple-950/30",
      };
    }
  };

  const advice = getHorizonRecommendation(params.targetYearHorizon);

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-xl shadow-2xl flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Sliders className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-100">Simulation Control Deck</h3>
          </div>
          <button
            onClick={resetParams}
            className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors px-2 py-1 rounded-lg hover:bg-slate-800"
            title="Reset parameters to baseline"
          >
            <RefreshCw className="h-3 w-3" /> Reset
          </button>
        </div>

        {/* SPECIAL FORECAST HORIZON SLIDER (3 to 15 Years) */}
        <div className="mt-5 rounded-2xl border border-cyan-500/30 bg-cyan-950/25 p-4 shadow-inner">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="flex items-center gap-1.5 font-bold text-cyan-200">
              <Calendar className="h-4 w-4 text-cyan-400" /> Forecast Horizon
            </span>
            <span className="rounded-md bg-cyan-900/70 border border-cyan-500/40 px-2.5 py-0.5 font-mono font-bold text-cyan-300 shadow-sm">
              {params.targetYearHorizon} Years (2025–{2025 + params.targetYearHorizon})
            </span>
          </div>

          <input
            type="range"
            min={3}
            max={15}
            step={1}
            value={params.targetYearHorizon}
            onChange={(e) => setParam("targetYearHorizon", Number(e.target.value))}
            className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer my-2"
          />

          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>3 Yrs (Near)</span>
            <span>8 Yrs (Mid)</span>
            <span>15 Yrs (Long-term)</span>
          </div>

          {/* Dynamic Model Recommendation Chip */}
          <div className={`mt-2.5 flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-[11px] ${advice.color}`}>
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              {advice.label}
            </span>
            {activeModelId !== advice.modelId && (
              <button
                onClick={() => setActiveModelId(advice.modelId)}
                className="shrink-0 rounded bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-400/40 px-1.5 py-0.5 text-[10px] font-bold text-white transition"
              >
                Switch Model
              </button>
            )}
          </div>
        </div>

        {/* Quick Scenario Presets */}
        <div className="mt-4">
          <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-2">
            Scenario Presets
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button
              onClick={() => applyPreset("drought")}
              className="rounded-lg border border-red-900/40 bg-red-950/20 px-2.5 py-1.5 text-center text-xs font-semibold text-red-300 hover:bg-red-900/40 transition"
            >
              🔥 Drought
            </button>
            <button
              onClick={() => applyPreset("conservation")}
              className="rounded-lg border border-emerald-900/40 bg-emerald-950/20 px-2.5 py-1.5 text-center text-xs font-semibold text-emerald-300 hover:bg-emerald-900/40 transition"
            >
              🌿 Max Save
            </button>
            <button
              onClick={() => applyPreset("monsoon-surplus")}
              className="rounded-lg border border-blue-900/40 bg-blue-950/20 px-2.5 py-1.5 text-center text-xs font-semibold text-blue-300 hover:bg-blue-900/40 transition"
            >
              🌧️ Monsoon
            </button>
            <button
              onClick={() => applyPreset("business-as-usual")}
              className="rounded-lg border border-slate-700 bg-slate-800/40 px-2.5 py-1.5 text-center text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
            >
              📊 Baseline
            </button>
          </div>
        </div>

        {/* Parameter Sliders */}
        <div className="mt-5 space-y-4">
          {/* 1. Rainfall Anomaly */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-300">
                <CloudRain className="h-3.5 w-3.5 text-blue-400" /> Rainfall Anomaly
              </span>
              <span className={`font-mono font-bold ${params.rainfallAnomalyPct > 0 ? "text-emerald-400" : params.rainfallAnomalyPct < 0 ? "text-red-400" : "text-slate-300"}`}>
                {params.rainfallAnomalyPct > 0 ? `+${params.rainfallAnomalyPct}%` : `${params.rainfallAnomalyPct}%`}
              </span>
            </div>
            <input
              type="range"
              min={-50}
              max={50}
              step={5}
              value={params.rainfallAnomalyPct}
              onChange={(e) => setParam("rainfallAnomalyPct", Number(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* 2. Extraction Delta */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Droplet className="h-3.5 w-3.5 text-amber-400" /> Extraction Draft
              </span>
              <span className={`font-mono font-bold ${params.extractionDeltaPct > 0 ? "text-red-400" : params.extractionDeltaPct < 0 ? "text-emerald-400" : "text-slate-300"}`}>
                {params.extractionDeltaPct > 0 ? `+${params.extractionDeltaPct}%` : `${params.extractionDeltaPct}%`}
              </span>
            </div>
            <input
              type="range"
              min={-40}
              max={60}
              step={5}
              value={params.extractionDeltaPct}
              onChange={(e) => setParam("extractionDeltaPct", Number(e.target.value))}
              className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* 3. Rainwater Harvesting (RWH) */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Building2 className="h-3.5 w-3.5 text-cyan-400" /> Rooftop RWH Adoption
              </span>
              <span className="font-mono font-bold text-cyan-400">
                {params.rwhAdoptionPct}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={params.rwhAdoptionPct}
              onChange={(e) => setParam("rwhAdoptionPct", Number(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* 4. Industrial Wastewater Recycling */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Factory className="h-3.5 w-3.5 text-purple-400" /> Industrial Treated Effluent
              </span>
              <span className="font-mono font-bold text-purple-400">
                {params.industrialRecyclingPct}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={params.industrialRecyclingPct}
              onChange={(e) => setParam("industrialRecyclingPct", Number(e.target.value))}
              className="w-full accent-purple-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* 5. Agricultural Drip Irrigation */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Sprout className="h-3.5 w-3.5 text-emerald-400" /> Micro-Irrigation Shift
              </span>
              <span className="font-mono font-bold text-emerald-400">
                {params.dripIrrigationShiftPct}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={params.dripIrrigationShiftPct}
              onChange={(e) => setParam("dripIrrigationShiftPct", Number(e.target.value))}
              className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
