import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend
} from "recharts";
import { useStudioStore } from "../../lib/store/studio-store";
import {
  TrendingDown,
  Scale,
  Zap,
  Flame,
  PieChart as PieIcon,
  AlertTriangle,
  Info,
  Calendar,
  Activity
} from "lucide-react";

export const ForecastChart: React.FC = () => {
  const { getPrediction, getCurrentDistrict, params } = useStudioStore();
  const prediction = getPrediction();
  const district = getCurrentDistrict();

  const [activeTab, setActiveTab] = useState<
    "depth" | "balance" | "energy" | "risk-matrix" | "sectors"
  >("depth");

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 md:p-7 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
      <div>
        {/* Header with Multi-Graph Tabs & Active Forecast Horizon Badge */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              <h3 className="font-semibold text-sm sm:text-base text-slate-100">
                Aquifer Depletion & Impact Telemetry Hub
              </h3>
              <span className="flex items-center gap-1 rounded-md bg-cyan-950 px-2 py-0.5 text-[11px] font-mono font-bold text-cyan-400 border border-cyan-800">
                <Calendar className="h-3 w-3" /> {params.targetYearHorizon}-Year Forecast (2025–{2025 + params.targetYearHorizon})
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              District: <span className="text-cyan-300 font-medium">{district.name}</span> • Active Engine: <span className="text-cyan-300 font-medium">{prediction.modelId}</span>
            </p>
          </div>

          {/* Graph Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 p-1">
            <button
              onClick={() => setActiveTab("depth")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "depth"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <TrendingDown className="h-3.5 w-3.5" /> Depth Curve
            </button>
            <button
              onClick={() => setActiveTab("balance")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "balance"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Scale className="h-3.5 w-3.5" /> Water Balance
            </button>
            <button
              onClick={() => setActiveTab("energy")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "energy"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Zap className="h-3.5 w-3.5" /> Energy & Costs
            </button>
            <button
              onClick={() => setActiveTab("risk-matrix")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "risk-matrix"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Flame className="h-3.5 w-3.5" /> Salinity & Failure
            </button>
            <button
              onClick={() => setActiveTab("sectors")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "sectors"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <PieIcon className="h-3.5 w-3.5" /> Sector Draft
            </button>
          </div>
        </div>

        {/* Tab 1: Water Table Depth Trajectory */}
        {activeTab === "depth" && (
          <div className="mt-4">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
              <span>Depth to Water Table below ground level (mbgl) across {params.targetYearHorizon} projected years.</span>
              <span className="font-mono text-cyan-300 font-semibold">Baseline: {district.baselineWaterLevelM} mbgl</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={prediction.projections} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="depthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="uncertaintyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis reversed={true} stroke="#64748b" tick={{ fontSize: 11 }} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#090e24", borderColor: "#1e293b", borderRadius: "0.75rem", fontSize: "12px", color: "#f8fafc" }}
                    formatter={(val: any, name: string) => {
                      if (name === "waterLevelM") return [`${val} mbgl`, "Water Table Depth"];
                      if (name === "upperBoundM") return [`${val} mbgl`, "Upper Confidence"];
                      if (name === "lowerBoundM") return [`${val} mbgl`, "Lower Confidence"];
                      return [val, name];
                    }}
                  />
                  <ReferenceLine y={district.baselineWaterLevelM} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "2024 Baseline", fill: "#f59e0b", fontSize: 10, position: "insideBottomRight" }} />
                  <Area type="monotone" dataKey="upperBoundM" stroke="transparent" fill="url(#uncertaintyGrad)" />
                  <Area type="monotone" dataKey="lowerBoundM" stroke="transparent" fill="url(#uncertaintyGrad)" />
                  <Area type="monotone" dataKey="waterLevelM" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#depthGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 2: Water Balance & Net Deficit (HAM) */}
        {activeTab === "balance" && (
          <div className="mt-4">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
              <span>Annual Groundwater Recharge vs Extraction Draft (Hectare Meters - HAM) over {params.targetYearHorizon} years.</span>
              <span className="text-amber-400 font-semibold font-mono">Net Deficit = Draft - Recharge</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prediction.projections} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#090e24", borderColor: "#1e293b", borderRadius: "0.75rem", fontSize: "12px", color: "#f8fafc" }}
                    formatter={(val: any, name: string) => [`${val} HAM`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} />
                  <Bar name="Annual Recharge" dataKey="annualRechargeHam" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar name="Annual Extraction Draft" dataKey="annualDraftHam" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar name="Net Aquifer Deficit" dataKey="netDeficitHam" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 3: Energy Surge & Agricultural Pumping Cost */}
        {activeTab === "energy" && (
          <div className="mt-4">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
              <span>Lift Energy Surge (%) vs Pumping Power Cost (₹/kWh) over {params.targetYearHorizon} years.</span>
              <span className="text-purple-400 font-semibold font-mono">Extra Cost: ₹{prediction.economicImpact.annualExtraEnergyCostCrores} Cr/yr</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={prediction.projections} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: "Energy Surge %", angle: -90, position: "insideLeft", fontSize: 10, fill: "#a855f7" }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: "Cost ₹/kWh", angle: 90, position: "insideRight", fontSize: 10, fill: "#06b6d4" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#090e24", borderColor: "#1e293b", borderRadius: "0.75rem", fontSize: "12px", color: "#f8fafc" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} />
                  <Line yAxisId="left" type="monotone" name="Pumping Energy Surge (%)" dataKey="energySurgePct" stroke="#a855f7" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line yAxisId="right" type="monotone" name="Estimated Tariffs (₹/kWh)" dataKey="pumpingCostPerKwhInr" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 4: Salinity Intrusion (TDS ppm) & Borewell Failure Probability */}
        {activeTab === "risk-matrix" && (
          <div className="mt-4">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
              <span>Deep Bedrock Salinity Intrusion (TDS ppm) vs Borewell Failure / Drying Rate (%) over {params.targetYearHorizon} years.</span>
              <span className="text-red-400 font-semibold font-mono">{prediction.economicImpact.borewellsAtRiskCount} Wells at Risk</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={prediction.projections} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="tds" stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: "TDS (ppm)", angle: -90, position: "insideLeft", fontSize: 10, fill: "#f59e0b" }} />
                  <YAxis yAxisId="failure" orientation="right" stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} label={{ value: "Failure Risk %", angle: 90, position: "insideRight", fontSize: 10, fill: "#ef4444" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#090e24", borderColor: "#1e293b", borderRadius: "0.75rem", fontSize: "12px", color: "#f8fafc" }}
                  />
                  <ReferenceLine yAxisId="tds" y={1000} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "WHO Potability Limit (1000 ppm)", fill: "#ef4444", fontSize: 9, position: "insideTopLeft" }} />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} />
                  <Line yAxisId="tds" type="monotone" name="Aquifer Salinity (TDS ppm)" dataKey="salinityTdsPpm" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line yAxisId="failure" type="monotone" name="Borewell Failure Probability (%)" dataKey="borewellFailureRiskPct" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 5: Sectoral Draft Composition */}
        {activeTab === "sectors" && (
          <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="h-60 w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={prediction.sectorBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="draftHam"
                    nameKey="sector"
                  >
                    {prediction.sectorBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#090e24", borderColor: "#1e293b", borderRadius: "0.75rem", fontSize: "12px", color: "#f8fafc" }}
                    formatter={(val: any, name: string) => [`${val} HAM`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full md:w-1/2 space-y-3">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Sectoral Consumption Breakdown (Total: {district.annualGroundwaterDraftHam} HAM)
              </h4>
              <div className="space-y-2">
                {prediction.sectorBreakdown.map((sector) => (
                  <div key={sector.sector} className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-2 font-medium text-slate-200">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: sector.color }} />
                        {sector.sector}
                      </span>
                      <span className="font-mono font-bold text-white">{sector.draftHam} HAM ({sector.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Feature Attribution Bar */}
      <div className="mt-4 border-t border-slate-800 pt-3">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
          <span className="flex items-center gap-1">
            <Info className="h-3 w-3 text-cyan-400" /> Model Feature Attributions (SHAP Sensitivity)
          </span>
          <span className="font-mono text-cyan-400 font-medium">R² = {prediction.metrics.r2} • RMSE = {prediction.metrics.rmse}m</span>
        </div>
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div className="bg-amber-500 transition-all duration-500" style={{ width: `${prediction.featureAttribution.extractionImpactPct}%` }} title={`Extraction: ${prediction.featureAttribution.extractionImpactPct}%`} />
          <div className="bg-blue-500 transition-all duration-500" style={{ width: `${prediction.featureAttribution.rainfallImpactPct}%` }} title={`Rainfall: ${prediction.featureAttribution.rainfallImpactPct}%`} />
          <div className="bg-cyan-400 transition-all duration-500" style={{ width: `${prediction.featureAttribution.rwhImpactPct}%` }} title={`RWH: ${prediction.featureAttribution.rwhImpactPct}%`} />
          <div className="bg-purple-500 transition-all duration-500" style={{ width: `${prediction.featureAttribution.aquiferStorageImpactPct}%` }} title={`Aquifer Strata: ${prediction.featureAttribution.aquiferStorageImpactPct}%`} />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-medium">
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Extraction Draft ({prediction.featureAttribution.extractionImpactPct}%)</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Rainfall Anomaly ({prediction.featureAttribution.rainfallImpactPct}%)</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> RWH Artificial Recharge ({prediction.featureAttribution.rwhImpactPct}%)</span>
        </div>
      </div>
    </div>
  );
};
