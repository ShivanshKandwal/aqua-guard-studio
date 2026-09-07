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

      {/* Dataset Lineage & High-Resolution Telemetry Provenance Banner */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-slate-900/90 via-cyan-950/20 to-slate-900/90 p-4 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-100">Official India-WRIS / CGWB Telemetry Panel (2015–2024)</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                Verified Sensor Data
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Trained on <strong className="text-cyan-300">31,200</strong> weekly DWLR piezometer observations across 60 regional monitoring wells in Delhi NCR.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="rounded-xl bg-slate-950/70 px-3 py-2 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block">Dataset Records</span>
            <span className="font-mono font-bold text-cyan-300">31,200</span>
          </div>
          <div className="rounded-xl bg-slate-950/70 px-3 py-2 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block">Active Piezometers</span>
            <span className="font-mono font-bold text-emerald-400">60 Stations</span>
          </div>
          <div className="rounded-xl bg-slate-950/70 px-3 py-2 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block">Frequency</span>
            <span className="font-mono font-bold text-purple-300">Weekly (52/yr)</span>
          </div>
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

                {/* Benchmark Metrics Grid: R2 Score & RMSE */}
                <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-950/80 p-3.5 border border-slate-800/90">
                  <div className="text-center border-r border-slate-800/80 pr-2">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">R² Score</div>
                    <div className="font-mono text-lg font-extrabold text-emerald-400 mt-0.5">{pred.metrics.r2}</div>
                    <span className="text-[10px] text-slate-500">Variance Explained</span>
                  </div>
                  <div className="text-center pl-2">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">RMSE</div>
                    <div className="font-mono text-lg font-extrabold text-cyan-300 mt-0.5">{pred.metrics.rmse}m</div>
                    <span className="text-[10px] text-slate-500">Root Mean Sq. Error</span>
                  </div>
                </div>

                {/* Additional Statistical Diagnostics */}
                <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-slate-950/40 p-2 border border-slate-800/50 text-[11px]">
                  <div className="flex justify-between px-1">
                    <span className="text-slate-500">MAE:</span>
                    <span className="font-mono font-semibold text-slate-300">{pred.metrics.mae}m</span>
                  </div>
                  <div className="flex justify-between px-1 border-l border-slate-800">
                    <span className="text-slate-500">Latency:</span>
                    <span className="font-mono font-semibold text-purple-300">{pred.metrics.inferenceTimeMs} ms</span>
                  </div>
                </div>

                {/* Immediate Predicted Value */}
                <div className="mt-4 flex items-center justify-between text-xs border-t border-slate-800 pt-3">
                  <span className="text-slate-400">Simulated Depth:</span>
                  <span className="font-mono font-bold text-cyan-300">{pred.predictedWaterLevelM} mbgl</span>
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
