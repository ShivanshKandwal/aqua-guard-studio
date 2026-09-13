import React from "react";
import { useStudioStore, getModelForHorizon } from "../../lib/store/studio-store";
import {
  Sliders,
  RefreshCw,
  CloudRain,
  Droplet,
  Building2,
  Factory,
  Sprout,
  Calendar,
  Sparkles,
  Zap,
} from "lucide-react";

export const MetricsControlDeck: React.FC = () => {
  const {
    params,
    setParam,
    resetParams,
    applyPreset,
    activeModelId,
    setActiveModelId,
    autoModelSwitchEnabled,
    setAutoModelSwitchEnabled,
    isServerSynced,
    isEvaluating,
    activeServerLabel,
    syncWithBackend,
  } = useStudioStore();

  const getHorizonRecommendation = (years: number) => {
    if (years <= 4) {
      return {
        modelId: "linreg-v1",
        name: "Linear Regression",
        label: "Linear Regression (Fast near-term slope baseline for <= 4 yrs)",
        color: "text-amber-300 border-amber-600/70 bg-amber-950/40",
      };
    } else if (years <= 9) {
      return {
        modelId: "xgboost-v1",
        name: "XGBoost Ensemble",
        label: "XGBoost Ensemble (Optimal for non-linear shocks for 5–9 yrs)",
        color: "text-cyan-300 border-cyan-500/70 bg-cyan-950/40",
      };
    } else {
      return {
        modelId: "lstm-v1",
        name: "LSTM Recurrent Net",
        label: "LSTM Recurrent Net (Multi-season lag & hysteresis for 10+ yrs)",
        color: "text-purple-300 border-purple-500/70 bg-purple-950/40",
      };
    }
  };

  const advice = getHorizonRecommendation(params.targetYearHorizon);

  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-900/60 p-4 backdrop-blur-2xl shadow-xl flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-700/80">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-cyan-500/15 flex items-center justify-center text-cyan-400 shadow-sm">
              <Sliders className="h-4 w-4" />
            </div>
            <h3 className="font-extrabold text-sm sm:text-base text-white">Simulation Control Deck</h3>
          </div>
          <button
            onClick={resetParams}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-300 hover:text-cyan-400 transition-colors px-2.5 py-1 rounded-lg hover:bg-slate-800 border border-slate-700/60"
            title="Reset parameters to baseline"
          >
            <RefreshCw className="h-3 w-3" /> Reset
          </button>
        </div>

        {/* SPECIAL FORECAST HORIZON SLIDER WITH AUTO-MODEL SWITCH */}
        <div className="mt-2.5 rounded-xl border border-cyan-500/40 bg-cyan-950/30 p-2.5 shadow-inner">
          <div className="flex justify-between items-center text-xs mb-1 flex-wrap gap-1.5">
            <span className="flex items-center gap-1.5 font-extrabold text-cyan-200 text-xs">
              <Calendar className="h-3.5 w-3.5 text-cyan-400" /> Forecast Horizon
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  const next = !autoModelSwitchEnabled;
                  setAutoModelSwitchEnabled(next);
                  if (next) {
                    setActiveModelId(getModelForHorizon(params.targetYearHorizon));
                  }
                }}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border transition-all cursor-pointer ${
                  autoModelSwitchEnabled
                    ? "bg-cyan-500/25 text-cyan-200 border-cyan-400/50 shadow-sm"
                    : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
                }`}
                title="Toggle automatic model selection based on horizon length"
              >
                <Zap className={`h-2.5 w-2.5 ${autoModelSwitchEnabled ? "text-cyan-300 fill-cyan-300" : ""}`} />
                {autoModelSwitchEnabled ? "Auto-Model: ON" : "Auto-Model: OFF"}
              </button>

              <span className="rounded-md bg-cyan-900/90 border border-cyan-400/50 px-2 py-0.5 font-mono font-extrabold text-[11px] text-cyan-200 shadow-sm">
                {params.targetYearHorizon} Yrs (2025–{2025 + params.targetYearHorizon})
              </span>
            </div>
          </div>

          <input
            type="range"
            min={3}
            max={15}
            step={1}
            value={params.targetYearHorizon}
            onChange={(e) => setParam("targetYearHorizon", Number(e.target.value))}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer my-1.5"
          />

          <div className="flex justify-between text-[10px] text-slate-300 font-mono font-medium">
            <span>3 Yrs (Near)</span>
            <span>8 Yrs (Mid)</span>
            <span>15 Yrs (Long-term)</span>
          </div>

          {/* Dynamic Model Recommendation / Active Auto Badge */}
          <div className={`mt-2 flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1 text-xs ${advice.color}`}>
            <span className="flex items-center gap-1.5 font-semibold text-[11px] leading-normal truncate">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-cyan-300" />
              <span className="truncate">
                {autoModelSwitchEnabled ? (
                  <>
                    <strong className="text-white font-extrabold">Auto:</strong> {advice.name} ({params.targetYearHorizon}y)
                  </>
                ) : (
                  advice.label
                )}
              </span>
            </span>

            {activeModelId !== advice.modelId && (
              <button
                onClick={() => setActiveModelId(advice.modelId)}
                className="shrink-0 rounded-md bg-cyan-500/25 hover:bg-cyan-500/40 border border-cyan-400/60 px-2 py-0.5 text-[10px] font-bold text-white transition"
              >
                Apply
              </button>
            )}
          </div>
        </div>

        {/* Quick Scenario Presets */}
        <div className="mt-2.5">
          <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
            Scenario Presets
          </label>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            <button
              onClick={() => applyPreset("drought")}
              className="rounded-lg border border-red-800/50 bg-red-950/30 px-2 py-1 text-center text-xs font-bold text-red-200 hover:bg-red-900/50 transition cursor-pointer shadow-sm"
            >
              🔥 Drought
            </button>
            <button
              onClick={() => applyPreset("conservation")}
              className="rounded-lg border border-emerald-800/50 bg-emerald-950/30 px-2 py-1 text-center text-xs font-bold text-emerald-200 hover:bg-emerald-900/50 transition cursor-pointer shadow-sm"
            >
              🌿 Max Save
            </button>
            <button
              onClick={() => applyPreset("monsoon-surplus")}
              className="rounded-lg border border-blue-800/50 bg-blue-950/30 px-2 py-1 text-center text-xs font-bold text-blue-200 hover:bg-blue-900/50 transition cursor-pointer shadow-sm"
            >
              🌧️ Monsoon
            </button>
            <button
              onClick={() => applyPreset("business-as-usual")}
              className="rounded-lg border border-slate-700 bg-slate-800/70 px-2 py-1 text-center text-xs font-bold text-slate-200 hover:bg-slate-700 transition cursor-pointer shadow-sm"
            >
              📊 Baseline
            </button>
          </div>
        </div>

        {/* Parameter Sliders with Clean Readable Labels */}
        <div className="mt-2.5 space-y-2">
          {/* 1. Rainfall Anomaly */}
          <div>
            <div className="flex justify-between text-xs mb-1 font-medium">
              <span className="flex items-center gap-1.5 text-slate-200 font-semibold text-xs">
                <CloudRain className="h-3.5 w-3.5 text-blue-400" /> Rainfall Anomaly
              </span>
              <span className={`font-mono font-bold text-xs ${params.rainfallAnomalyPct > 0 ? "text-emerald-400" : params.rainfallAnomalyPct < 0 ? "text-red-400" : "text-slate-200"}`}>
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
            <div className="flex justify-between text-xs mb-1 font-medium">
              <span className="flex items-center gap-1.5 text-slate-200 font-semibold text-xs">
                <Droplet className="h-3.5 w-3.5 text-amber-400" /> Extraction Draft
              </span>
              <span className={`font-mono font-bold text-xs ${params.extractionDeltaPct > 0 ? "text-red-400" : params.extractionDeltaPct < 0 ? "text-emerald-400" : "text-slate-200"}`}>
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
            <div className="flex justify-between text-xs mb-1 font-medium">
              <span className="flex items-center gap-1.5 text-slate-200 font-semibold text-xs">
                <Building2 className="h-3.5 w-3.5 text-cyan-400" /> Rooftop RWH
              </span>
              <span className="font-mono font-bold text-cyan-400 text-xs">
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
            <div className="flex justify-between text-xs mb-1 font-medium">
              <span className="flex items-center gap-1.5 text-slate-200 font-semibold text-xs">
                <Factory className="h-3.5 w-3.5 text-purple-400" /> Industrial Effluent
              </span>
              <span className="font-mono font-bold text-purple-400 text-xs">
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
            <div className="flex justify-between text-xs mb-1 font-medium">
              <span className="flex items-center gap-1.5 text-slate-200 font-semibold text-xs">
                <Sprout className="h-3.5 w-3.5 text-emerald-400" /> Micro-Irrigation
              </span>
              <span className="font-mono font-bold text-emerald-400 text-xs">
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

        {/* EXECUTE BUTTON & TELEMETRY INDICATOR */}
        <div className="mt-3 pt-2.5 border-t border-slate-700/80 space-y-2">
          <button
            onClick={() => syncWithBackend()}
            disabled={isEvaluating}
            className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 p-[1px] font-bold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all duration-200 disabled:opacity-60 cursor-pointer"
          >
            <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-950/90 px-3 py-2.5 backdrop-blur-xl group-hover:bg-transparent transition-colors">
              {isEvaluating ? (
                <>
                  <RefreshCw className="h-4 w-4 text-cyan-300 animate-spin" />
                  <span className="text-xs sm:text-sm font-extrabold tracking-wide text-cyan-100">
                    Executing ML Pipeline...
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-cyan-300 group-hover:rotate-12 transition-transform" />
                  <span className="text-xs sm:text-sm font-extrabold tracking-wide text-white">
                    Send & Execute Model Prediction
                  </span>
                </>
              )}
            </div>
          </button>

          {/* Last Execution Telemetry Pill */}
          <div className="flex items-center justify-between text-[11px] text-slate-300 px-1 font-mono">
            <span className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${isServerSynced ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
              <span className="font-semibold truncate max-w-[200px]">{isServerSynced ? activeServerLabel : "Analytical Engine Fallback"}</span>
            </span>
            <span className="text-cyan-300 font-extrabold">
              {activeModelId.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};