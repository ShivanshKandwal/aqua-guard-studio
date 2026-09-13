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
    <div className="rounded-3xl border border-slate-700/80 bg-slate-900/60 p-6 sm:p-7 backdrop-blur-2xl shadow-2xl flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/80">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400 shadow-sm">
              <Sliders className="h-5 w-5" />
            </div>
            <h3 className="font-extrabold text-base sm:text-lg text-white">Simulation Control Deck</h3>
          </div>
          <button
            onClick={resetParams}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-cyan-400 transition-colors px-3 py-1.5 rounded-xl hover:bg-slate-800 border border-slate-700/60"
            title="Reset parameters to baseline"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>

        {/* SPECIAL FORECAST HORIZON SLIDER WITH AUTO-MODEL SWITCH */}
        <div className="mt-5 rounded-2xl border border-cyan-500/40 bg-cyan-950/30 p-4 sm:p-5 shadow-inner">
          <div className="flex justify-between items-center text-sm mb-2 flex-wrap gap-2">
            <span className="flex items-center gap-2 font-extrabold text-cyan-200">
              <Calendar className="h-4 w-4 text-cyan-400" /> Forecast Horizon
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const next = !autoModelSwitchEnabled;
                  setAutoModelSwitchEnabled(next);
                  if (next) {
                    setActiveModelId(getModelForHorizon(params.targetYearHorizon));
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold border transition-all cursor-pointer ${
                  autoModelSwitchEnabled
                    ? "bg-cyan-500/25 text-cyan-200 border-cyan-400/50 shadow-sm"
                    : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
                }`}
                title="Toggle automatic model selection based on horizon length"
              >
                <Zap className={`h-3 w-3 ${autoModelSwitchEnabled ? "text-cyan-300 fill-cyan-300" : ""}`} />
                {autoModelSwitchEnabled ? "Auto-Model: ON" : "Auto-Model: OFF"}
              </button>

              <span className="rounded-lg bg-cyan-900/90 border border-cyan-400/50 px-3 py-1 font-mono font-extrabold text-xs text-cyan-200 shadow-sm">
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
            className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer my-2.5"
          />

          <div className="flex justify-between text-xs text-slate-300 font-mono font-medium">
            <span>3 Yrs (Near)</span>
            <span>8 Yrs (Mid)</span>
            <span>15 Yrs (Long-term)</span>
          </div>

          {/* Dynamic Model Recommendation / Active Auto Badge */}
          <div className={`mt-3 flex items-center justify-between gap-2.5 rounded-xl border px-3 py-2 text-xs sm:text-sm ${advice.color}`}>
            <span className="flex items-center gap-2 font-semibold leading-normal">
              <Sparkles className="h-4 w-4 shrink-0 text-cyan-300" />
              <span>
                {autoModelSwitchEnabled ? (
                  <>
                    <strong className="text-white font-extrabold">Auto-Assigned:</strong> {advice.name} ({params.targetYearHorizon}y horizon)
                  </>
                ) : (
                  advice.label
                )}
              </span>
            </span>

            {activeModelId !== advice.modelId && (
              <button
                onClick={() => setActiveModelId(advice.modelId)}
                className="shrink-0 rounded-lg bg-cyan-500/25 hover:bg-cyan-500/40 border border-cyan-400/60 px-2.5 py-1 text-xs font-bold text-white transition"
              >
                Apply
              </button>
            )}
          </div>
        </div>

        {/* Quick Scenario Presets */}
        <div className="mt-5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5">
            Scenario Presets
          </label>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <button
              onClick={() => applyPreset("drought")}
              className="rounded-xl border border-red-800/50 bg-red-950/30 px-3 py-2 text-center text-xs sm:text-sm font-bold text-red-200 hover:bg-red-900/50 transition cursor-pointer shadow-sm"
            >
              🔥 Drought
            </button>
            <button
              onClick={() => applyPreset("conservation")}
              className="rounded-xl border border-emerald-800/50 bg-emerald-950/30 px-3 py-2 text-center text-xs sm:text-sm font-bold text-emerald-200 hover:bg-emerald-900/50 transition cursor-pointer shadow-sm"
            >
              🌿 Max Save
            </button>
            <button
              onClick={() => applyPreset("monsoon-surplus")}
              className="rounded-xl border border-blue-800/50 bg-blue-950/30 px-3 py-2 text-center text-xs sm:text-sm font-bold text-blue-200 hover:bg-blue-900/50 transition cursor-pointer shadow-sm"
            >
              🌧️ Monsoon
            </button>
            <button
              onClick={() => applyPreset("business-as-usual")}
              className="rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2 text-center text-xs sm:text-sm font-bold text-slate-200 hover:bg-slate-700 transition cursor-pointer shadow-sm"
            >
              📊 Baseline
            </button>
          </div>
        </div>

        {/* Parameter Sliders with Enlarged Readable Labels */}
        <div className="mt-6 space-y-4">
          {/* 1. Rainfall Anomaly */}
          <div>
            <div className="flex justify-between text-xs sm:text-sm mb-1.5 font-medium">
              <span className="flex items-center gap-2 text-slate-200 font-semibold">
                <CloudRain className="h-4 w-4 text-blue-400" /> Rainfall Anomaly
              </span>
              <span className={`font-mono font-bold ${params.rainfallAnomalyPct > 0 ? "text-emerald-400" : params.rainfallAnomalyPct < 0 ? "text-red-400" : "text-slate-200"}`}>
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
              className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* 2. Extraction Delta */}
          <div>
            <div className="flex justify-between text-xs sm:text-sm mb-1.5 font-medium">
              <span className="flex items-center gap-2 text-slate-200 font-semibold">
                <Droplet className="h-4 w-4 text-amber-400" /> Extraction Draft
              </span>
              <span className={`font-mono font-bold ${params.extractionDeltaPct > 0 ? "text-red-400" : params.extractionDeltaPct < 0 ? "text-emerald-400" : "text-slate-200"}`}>
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
              className="w-full accent-amber-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* 3. Rainwater Harvesting (RWH) */}
          <div>
            <div className="flex justify-between text-xs sm:text-sm mb-1.5 font-medium">
              <span className="flex items-center gap-2 text-slate-200 font-semibold">
                <Building2 className="h-4 w-4 text-cyan-400" /> Rooftop RWH Adoption
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
              className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* 4. Industrial Wastewater Recycling */}
          <div>
            <div className="flex justify-between text-xs sm:text-sm mb-1.5 font-medium">
              <span className="flex items-center gap-2 text-slate-200 font-semibold">
                <Factory className="h-4 w-4 text-purple-400" /> Industrial Treated Effluent
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
              className="w-full accent-purple-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* 5. Agricultural Drip Irrigation */}
          <div>
            <div className="flex justify-between text-xs sm:text-sm mb-1.5 font-medium">
              <span className="flex items-center gap-2 text-slate-200 font-semibold">
                <Sprout className="h-4 w-4 text-emerald-400" /> Micro-Irrigation Shift
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
              className="w-full accent-emerald-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* EXECUTE BUTTON & TELEMETRY INDICATOR */}
        <div className="mt-8 pt-5 border-t border-slate-700/80 space-y-3.5">
          <button
            onClick={() => syncWithBackend()}
            disabled={isEvaluating}
            className="w-full relative group overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 p-[1px] font-bold text-white shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 disabled:opacity-60 cursor-pointer"
          >
            <div className="flex items-center justify-center gap-3 rounded-2xl bg-slate-950/90 px-4 py-4 backdrop-blur-xl group-hover:bg-transparent transition-colors">
              {isEvaluating ? (
                <>
                  <RefreshCw className="h-5 w-5 text-cyan-300 animate-spin" />
                  <span className="text-sm sm:text-base font-extrabold tracking-wide text-cyan-100">
                    Executing Python ML Pipeline...
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 text-cyan-300 group-hover:rotate-12 transition-transform" />
                  <span className="text-sm sm:text-base font-extrabold tracking-wide text-white">
                    Send & Execute Model Prediction
                  </span>
                </>
              )}
            </div>
          </button>

          {/* Last Execution Telemetry Pill */}
          <div className="flex items-center justify-between text-xs text-slate-300 px-1 font-mono">
            <span className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${isServerSynced ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
              <span className="font-semibold">{isServerSynced ? activeServerLabel : "Running in analytical engine fallback"}</span>
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