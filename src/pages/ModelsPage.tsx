import React from "react";
import { useStudioStore } from "../lib/store/studio-store";
import { listAvailableModels } from "../lib/ml/model-registry";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { Cpu, CheckCircle2, Layers, Award, Sparkles, BarChart3 } from "lucide-react";

export const ModelsPage: React.FC = () => {
  const { getCurrentDistrict, params, activeModelId, setActiveModelId } = useStudioStore();
  const district = getCurrentDistrict();
  const allModels = listAvailableModels();

  // Run all models on current district & parameters for side-by-side comparison
  const allPredictions = allModels.map((m) => m.predict(district, params));

  // Merge projection curves for Recharts
  const mergedProjections = allPredictions[0].projections.map((p, index) => {
    const row: any = { year: p.year };
    allPredictions.forEach((pred) => {
      row[pred.modelId] = pred.projections[index]?.waterLevelM ?? p.waterLevelM;
    });
    return row;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-md bg-cyan-500/20 px-2 py-0.5 text-xs font-semibold text-cyan-300 border border-cyan-500/30">
              <Cpu className="h-3 w-3" /> Machine Learning Benchmarking Lab
            </span>
            <span className="text-xs text-slate-400">Context: {district.name}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
            Multi-Model Evaluation & Statistical Comparison
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-0.5">
            Cross-evaluate Linear Regression, XGBoost Decision Trees, and Long Short-Term Memory (LSTM) models against official CGWB historical hydrological data.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Active Production Model:</span>
          <span className="rounded-lg bg-cyan-950 px-3 py-1.5 text-xs font-bold text-cyan-400 border border-cyan-800">
            {activeModelId}
          </span>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {allModels.map((m) => {
          const pred = allPredictions.find((p) => p.modelId === m.id)!;
          const isActive = m.id === activeModelId;

          return (
            <div
              key={m.id}
              className={`rounded-2xl border p-5 backdrop-blur-md transition-all shadow-xl flex flex-col justify-between ${
                isActive
                  ? "border-cyan-500/50 bg-slate-900/90 shadow-cyan-500/10 ring-1 ring-cyan-500/30"
                  : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">{m.name}</h3>
                    <span className="text-[11px] text-cyan-400 font-mono">{m.id}</span>
                  </div>
                  {isActive && (
                    <span className="flex items-center gap-1 rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-300 border border-cyan-500/30">
                      <Award className="h-3 w-3" /> Active
                    </span>
                  )}
                </div>

                <p className="mt-3 text-xs text-slate-400 leading-relaxed min-h-[48px]">
                  {m.description}
                </p>

                {/* Benchmark Metrics Grid */}
                <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-950/70 p-3 border border-slate-800/80">
                  <div className="text-center">
                    <div className="text-[10px] text-slate-500 font-medium">RMSE</div>
                    <div className="font-mono text-xs font-bold text-slate-200">{pred.metrics.rmse}m</div>
                  </div>
                  <div className="text-center border-x border-slate-800">
                    <div className="text-[10px] text-slate-500 font-medium">R² Score</div>
                    <div className="font-mono text-xs font-bold text-emerald-400">{pred.metrics.r2}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-slate-500 font-medium">MAE</div>
                    <div className="font-mono text-xs font-bold text-slate-200">{pred.metrics.mae}m</div>
                  </div>
                </div>

                {/* Immediate Predicted Value */}
                <div className="mt-4 flex items-center justify-between text-xs border-t border-slate-800 pt-3">
                  <span className="text-slate-400">Simulated Depth:</span>
                  <span className="font-mono font-bold text-cyan-300">{pred.predictedWaterLevelM} mbgl</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Extraction Stage:</span>
                  <span className="font-mono font-bold text-slate-200">{pred.predictedExtractionPct}%</span>
                </div>
              </div>

              <button
                onClick={() => setActiveModelId(m.id)}
                disabled={isActive}
                className={`mt-5 w-full rounded-xl py-2 text-xs font-semibold transition ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 cursor-default"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                }`}
              >
                {isActive ? "Currently Selected" : "Set as Active Model"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Multi-Model Forecast Overlay Chart */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-cyan-400" />
            <h3 className="font-semibold text-sm text-slate-100">
              Cross-Model Multi-Year Trajectory Overlay (2025–2035)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Evaluating depth trajectories across identical scenario parameters
          </span>
        </div>

        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mergedProjections} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis
                reversed={true}
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                domain={['dataMin - 2', 'dataMax + 2']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#090e24",
                  borderColor: "#1e293b",
                  borderRadius: "0.75rem",
                  fontSize: "12px",
                  color: "#f8fafc",
                }}
                formatter={(val: any, name: string) => [`${val} mbgl`, name]}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
              />
              <Line
                type="monotone"
                name="XGBoost Ensemble"
                dataKey="xgboost-v1"
                stroke="#06b6d4"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                name="LSTM Recurrent Net"
                dataKey="lstm-v1"
                stroke="#a855f7"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                name="Linear Regression"
                dataKey="linreg-v1"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
