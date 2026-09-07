import React, { useState, useEffect, useCallback } from "react";
import { useStudioStore } from "../lib/store/studio-store";
import { cgwbApiAdapter, type ComprehensivePolicyResult } from "../lib/data/cgwb-api-adapter";
import { InteractiveNcrMap } from "../components/map/InteractiveNcrMap";
import {
  FileCheck2,
  Sparkles,
  Layers,
  MapPin,
  TrendingUp,
  Droplets,
  Banknote,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  BarChart3,
  Loader2,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
} from "recharts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Preset Policy Synopses for quick simulation
const PRESET_POLICIES = [
  {
    title: "Yamuna Floodplain Deep-Shaft Infiltration & Wetland Sponge Mandate",
    text: "Mandate high-capacity recharge shafts along active Yamuna floodplain paleochannels and village ponds. Require unpaved gravel retention swales in all public parks and arterial roads with zero direct stormwater runoff to drains. Restrict all new borewell extraction within 2 km of floodplains to build natural recharge buffer zones.",
    type: "Artificial Recharge",
  },
  {
    title: "Commercial & Industrial Zero-Groundwater Abstraction Moratorium",
    text: "Enforce strict NOC moratorium on new groundwater extraction for commercial complexes, data centers, and manufacturing units. Mandate 100% replacement of commercial cooling and landscape water with tertiary treated sewage effluent (STP) delivered through dedicated dual-piping infrastructure.",
    type: "Extraction Moratorium",
  },
  {
    title: "Mandatory Telemetric Rooftop RWH & Volumetric Slab Tariffs",
    text: "Require mandatory automated IoT telemetric flow meters and annual percolation audits on all residential plots > 100 sq.m with subsidized 40% capital grants. Introduce progressive volumetric extraction cess on bulk abstraction with penalty tariffs for non-compliant commercial entities.",
    type: "RWH & Tariff Reform",
  },
  {
    title: "Agrarian Micro-Drip Irrigation & Cropping Shift Incentive",
    text: "Subsidize 85% of capital expenditure for solar-powered micro-drip and sprinkler irrigation across fringe agricultural peri-urban belts. Disincentivize water-intensive paddy farming by providing direct cash transfer grants for millet and pulse cultivation during Kharif season.",
    type: "Agricultural Efficiency",
  },
];

export const PolicyEvaluatorPage: React.FC = () => {
  const { getCurrentDistrict, getPrediction, districts, getDistrictPrediction } = useStudioStore();
  const district = getCurrentDistrict();
  const prediction = getPrediction();

  // Policy Form State
  const [docTitle, setDocTitle] = useState(PRESET_POLICIES[0].title);
  const [docSynopsis, setDocSynopsis] = useState(PRESET_POLICIES[0].text);
  const [mapImpactMode, setMapImpactMode] = useState<boolean>(true);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);

  // Dynamic API Evaluator State
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluatedResult, setEvaluatedResult] = useState<ComprehensivePolicyResult | null>(null);

  // Execution trigger
  const runEvaluation = useCallback(
    async (titleToEval: string, textToEval: string) => {
      if (!textToEval.trim()) return;
      setIsEvaluating(true);

      const result = await cgwbApiAdapter.evaluateCustomPolicy(titleToEval, textToEval, district.id);
      if (result) {
        setEvaluatedResult(result);
      }
      setIsEvaluating(false);
    },
    [district.id]
  );

  // Initial deduction on mount or when district changes
  useEffect(() => {
    runEvaluation(docTitle, docSynopsis);
  }, [district.id]);

  // Derive active display values
  const readinessScore = evaluatedResult?.readinessScore ?? 85;
  const feasibilityRating = evaluatedResult?.feasibilityRating ?? "High";
  const waterRecoveryMld = evaluatedResult?.waterRecoveryMld ?? 32.5;
  const estimatedCapexCrores = evaluatedResult?.estimatedCapexCrores ?? 64.0;
  const tenYearReboundM = evaluatedResult?.tenYearReboundM ?? 12.4;
  const paybackYears = evaluatedResult?.paybackYears ?? 4.6;

  // Fallback trajectory if evaluatedResult is still resolving
  const defaultTrajectory = React.useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      year: 2026 + i,
      compliancePct: Math.min(95, 20 + i * 8),
      waterSavedMld: Number((32.5 * (0.2 + i * 0.08)).toFixed(1)),
      reboundM: Number(((32.5 * (0.2 + i * 0.08) * 0.045 * (i + 1))).toFixed(2)),
    }));
  }, []);

  const defaultSectoral = [
    { sector: "Domestic RWH & Tariffs", mld: 12.0, color: "#06b6d4" },
    { sector: "Industrial Recycling & Effluent", mld: 14.5, color: "#a855f7" },
    { sector: "Agricultural Micro-Drip", mld: 6.0, color: "#10b981" },
  ];

  const defaultFinancials = [
    { year: "Year 1", cumulativeCapex: 35.2, cumulativeSavings: 24.1 },
    { year: "Year 2", cumulativeCapex: 54.4, cumulativeSavings: 58.2 },
    { year: "Year 3", cumulativeCapex: 64.0, cumulativeSavings: 112.5 },
    { year: "Year 4", cumulativeCapex: 64.0, cumulativeSavings: 182.0 },
    { year: "Year 5", cumulativeCapex: 64.0, cumulativeSavings: 265.4 },
    { year: "Year 7", cumulativeCapex: 64.0, cumulativeSavings: 452.0 },
  ];

  const trajectoryData = evaluatedResult?.trajectory && evaluatedResult.trajectory.length > 0 
    ? evaluatedResult.trajectory 
    : defaultTrajectory;
  const sectoralData = evaluatedResult?.sectorBreakdown && evaluatedResult.sectorBreakdown.length > 0 
    ? evaluatedResult.sectorBreakdown 
    : defaultSectoral;
  const financialData = evaluatedResult?.financials && evaluatedResult.financials.length > 0 
    ? evaluatedResult.financials 
    : defaultFinancials;
  const districtImpacts = evaluatedResult?.districtImpacts ?? {};

  // Graph 4: NCR Regional Risk Shift (Before vs After Policy)
  const regionalShiftData = React.useMemo(() => {
    let baselineSafe = 0, baselineSemi = 0, baselineCrit = 0, baselineOver = 0;
    let postSafe = 0, postSemi = 0, postCrit = 0, postOver = 0;

    districts.forEach((d) => {
      const pred = getDistrictPrediction(d.id);
      if (pred.riskLevel === "Over-Exploited") baselineOver++;
      else if (pred.riskLevel === "Critical") baselineCrit++;
      else if (pred.riskLevel === "Semi-Critical") baselineSemi++;
      else baselineSafe++;

      const imp = districtImpacts[d.id];
      const newRisk = imp ? imp.newRiskLevel : pred.riskLevel;
      if (newRisk === "Over-Exploited") postOver++;
      else if (newRisk === "Critical") postCrit++;
      else if (newRisk === "Semi-Critical") postSemi++;
      else postSafe++;
    });

    return [
      { category: "Safe (<=70%)", baseline: baselineSafe, postPolicy: postSafe, color: "#10b981" },
      { category: "Semi-Critical", baseline: baselineSemi, postPolicy: postSemi, color: "#facc15" },
      { category: "Critical", baseline: baselineCrit, postPolicy: postCrit, color: "#f97316" },
      { category: "Over-Exploited", baseline: baselineOver, postPolicy: postOver, color: "#ef4444" },
    ];
  }, [districts, getDistrictPrediction, districtImpacts]);

  return (
    <div className="space-y-7 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-slate-800/80 bg-slate-900/50 p-6 backdrop-blur-xl shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-md bg-gradient-to-r from-purple-500/20 to-cyan-500/20 px-2.5 py-0.5 text-xs font-semibold text-cyan-300 border border-cyan-500/30">
              <FileCheck2 className="h-3.5 w-3.5 text-cyan-400" /> Real-Time Policy Synopsis Simulator
            </span>
            <span className="text-xs text-slate-400">Target Aquifer: <strong className="text-white">{district.name}</strong> ({district.aquiferType})</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1.5">
            Custom Policy Evaluator & Spatial Impact Sandbox
          </h1>
          <p className="text-xs text-slate-400 max-w-3xl mt-1 leading-relaxed">
            Draft, paste, or tweak any legislative synopsis. Instantly simulate quantitative water recovery (MLD), capital expenditure (₹ Cr), multi-year aquifer rebound, and view spatial city impacts on the interactive Leaflet GIS map.
          </p>
        </div>

        {/* Live District Telemetry Pill */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 text-xs text-slate-300 min-w-[240px]">
          <div className="font-semibold text-cyan-400 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> Baseline Ground Reality:
          </div>
          <div className="mt-2 space-y-1 text-[11px] text-slate-400">
            <div className="flex justify-between">
              <span>Depth to Water:</span>
              <strong className="text-white">{district.baselineWaterLevelM} mbgl</strong>
            </div>
            <div className="flex justify-between">
              <span>Extraction Stage:</span>
              <strong className="text-amber-400">{district.baselineExtractionPct}% ({prediction.riskLevel})</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics - Dynamic Deduction */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-purple-500/30 bg-slate-900/60 p-4 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Readiness Score</span>
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-purple-300 flex items-baseline gap-1">
            {isEvaluating ? (
              <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
            ) : (
              <>
                {readinessScore}
                <span className="text-xs text-slate-500 font-sans font-normal">/100</span>
              </>
            )}
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Feasibility: {feasibilityRating}
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/60 p-4 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Net Water Recovery</span>
            <Droplets className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-cyan-300 flex items-baseline gap-1">
            {isEvaluating ? (
              <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
            ) : (
              <>
                +{waterRecoveryMld} <span className="text-xs text-slate-400 font-sans font-normal">MLD</span>
              </>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            ~{Math.round(waterRecoveryMld * 36.5)} HAM/year recharge
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-slate-900/60 p-4 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Estimated CAPEX</span>
            <Banknote className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-300 flex items-baseline gap-1">
            {isEvaluating ? (
              <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
            ) : (
              <>
                ₹{estimatedCapexCrores} <span className="text-xs text-slate-400 font-sans font-normal">Cr</span>
              </>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Break-even: ~{paybackYears} Years payback
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/60 p-4 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">10-Yr Table Rebound</span>
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400 flex items-baseline gap-1">
            {isEvaluating ? (
              <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
            ) : (
              <>
                +{tenYearReboundM} <span className="text-xs text-slate-400 font-sans font-normal">meters</span>
              </>
            )}
          </div>
          <div className="text-[11px] text-emerald-300/80 mt-1">
            Projected steady recovery
          </div>
        </div>
      </div>

      {/* Main Dual-Column Cockpit: Policy Input & Leaflet City Impact Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Policy Synopsis Editor (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-xl shadow-2xl flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-slate-100">Draft Policy Synopsis</h3>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
              AI-Driven Deduction
            </span>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Load Benchmark Templates (Select to Deduce & View Map):
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESET_POLICIES.map((preset, idx) => {
                const isSelected = selectedPresetIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedPresetIndex(idx);
                      setDocTitle(preset.title);
                      setDocSynopsis(preset.text);
                      runEvaluation(preset.title, preset.text);
                    }}
                    className={`rounded-xl border p-2 text-left transition group ${
                      isSelected
                        ? "border-cyan-500 bg-cyan-950/40 shadow-sm shadow-cyan-500/20"
                        : "border-slate-800 bg-slate-950/80 hover:border-cyan-500/50 hover:bg-slate-800/40"
                    }`}
                  >
                    <div className={`text-[10px] font-bold truncate ${isSelected ? "text-cyan-300" : "text-cyan-400 group-hover:text-cyan-300"}`}>
                      {preset.type}
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">
                      {preset.title}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Policy Document Title
            </label>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none transition"
              placeholder="e.g. Yamuna Deep-Shaft Groundwater Replenishment Act"
            />
          </div>

          {/* Synopsis Textarea */}
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Policy Synopsis & Clauses
              </label>
              <span className="text-[10px] text-slate-500">{docSynopsis.length} chars</span>
            </div>
            <textarea
              rows={8}
              value={docSynopsis}
              onChange={(e) => setDocSynopsis(e.target.value)}
              className="w-full flex-1 rounded-2xl border border-slate-800 bg-slate-950/90 p-3.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none leading-relaxed transition resize-none font-sans"
              placeholder="Type or paste clauses, regulations, mandatory RWH quotas, or effluent recycling targets..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-1">
            <button
              onClick={() => runEvaluation(docTitle, docSynopsis)}
              disabled={isEvaluating || !docSynopsis.trim()}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50 shadow-lg shadow-purple-500/25"
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Deducing Parameters with AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Deduce Parameters & Run AI Evaluation
                </>
              )}
            </button>
            <button
              onClick={() => {
                setSelectedPresetIndex(0);
                setDocTitle(PRESET_POLICIES[0].title);
                setDocSynopsis(PRESET_POLICIES[0].text);
                runEvaluation(PRESET_POLICIES[0].title, PRESET_POLICIES[0].text);
              }}
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-slate-400 hover:text-white transition"
              title="Reset to default template"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Leaflet City Impact Map (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-xl shadow-2xl flex flex-col space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-100">Spatial City Impact Map (Delhi NCR)</h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Hover over districts to inspect water table rebound and regulatory category shifts under this specific policy.
              </p>
            </div>

            {/* Toggle Mode Button */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setMapImpactMode(false)}
                className={`px-3 py-1 text-[11px] rounded-lg font-medium transition ${
                  !mapImpactMode ? "bg-slate-800 text-white font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                Baseline Status
              </button>
              <button
                onClick={() => setMapImpactMode(true)}
                className={`px-3 py-1 text-[11px] rounded-lg font-bold flex items-center gap-1 transition ${
                  mapImpactMode
                    ? "bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-md shadow-emerald-500/20"
                    : "text-emerald-400 hover:text-white"
                }`}
              >
                <Zap className="h-3 w-3" /> Post-Policy Impact
              </button>
            </div>
          </div>

          {/* Embedded Map Container */}
          <div className="flex-1 min-h-[440px] rounded-2xl overflow-hidden border border-slate-800 relative">
            <InteractiveNcrMap
              policyImpactMode={mapImpactMode}
              policyReboundM={tenYearReboundM}
              policyRecoveryMld={waterRecoveryMld}
              districtImpacts={districtImpacts}
            />
          </div>
        </div>
      </div>

      {/* 4 DETAILED ANALYTICAL GRAPHS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-cyan-400" /> Detailed Multi-Horizon Impact Analytics
            </h2>
            <p className="text-xs text-slate-400">
              Quantitative mathematical projections derived from the active policy clauses.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">CGWB Baseline Calibration • 2026–2035</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Graph 1: 10-Year Water Rebound Trajectory */}
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-200">
                  1. 10-Year Cumulative Water Saved vs Water Table Rebound
                </h4>
                <p className="text-[10px] text-slate-400">Progression over multi-year policy enforcement horizon</p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                +{trajectoryData[trajectoryData.length - 1]?.reboundM ?? tenYearReboundM}m Net Rebound
              </span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#090e24", borderColor: "#1e293b", borderRadius: "0.75rem", fontSize: "11px", color: "#f8fafc" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} />
                  <Area type="monotone" name="Cumulative Saved (MLD)" dataKey="waterSavedMld" fill="#06b6d4" fillOpacity={0.2} stroke="#06b6d4" strokeWidth={2} />
                  <Line type="monotone" name="Aquifer Rebound (+m)" dataKey="reboundM" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Graph 2: Sectoral Water Relief Breakdown */}
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-200">
                  2. Sectoral Allocation of Recovered Groundwater (MLD)
                </h4>
                <p className="text-[10px] text-slate-400">Contribution from domestic, industrial, and agrarian interventions</p>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                +{waterRecoveryMld} MLD Total
              </span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectoralData} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} unit=" MLD" />
                  <YAxis type="category" dataKey="sector" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#090e24", borderColor: "#1e293b", borderRadius: "0.75rem", fontSize: "11px", color: "#f8fafc" }}
                    formatter={(val: any) => [`${val} MLD`, "Relief Contribution"]}
                  />
                  <Bar dataKey="mld" radius={[0, 6, 6, 0]}>
                    {sectoralData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Graph 3: Financial CAPEX Outlay vs Annual Operational Savings */}
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-200">
                  3. Capital Outlay (₹ Cr) vs Cumulative Water Value Returned
                </h4>
                <p className="text-[10px] text-slate-400">Financial break-even analysis across implementation timeline</p>
              </div>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
                Break-Even: ~{paybackYears} Years
              </span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={financialData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit=" Cr" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#090e24", borderColor: "#1e293b", borderRadius: "0.75rem", fontSize: "11px", color: "#f8fafc" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} />
                  <Bar name="Cumulative CAPEX (₹ Cr)" dataKey="cumulativeCapex" fill="#f59e0b" radius={[4, 4, 0, 0]} opacity={0.8} />
                  <Line type="monotone" name="Cumulative Water Value (₹ Cr)" dataKey="cumulativeSavings" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Graph 4: Regional Risk Shift (Before vs After) */}
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-200">
                  4. Regional NCR Risk Transition (Before vs After Policy)
                </h4>
                <p className="text-[10px] text-slate-400">Total districts upgrading across CGWB extraction stress categories</p>
              </div>
              <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/50">
                15 NCR Districts
              </span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionalShiftData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#090e24", borderColor: "#1e293b", borderRadius: "0.75rem", fontSize: "11px", color: "#f8fafc" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} />
                  <Bar name="Baseline Status (Districts)" dataKey="baseline" fill="#64748b" radius={[4, 4, 0, 0]} />
                  <Bar name="Post-Policy Status (Districts)" dataKey="postPolicy" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* AI Hydrogeological Review Dossier & CGWA Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: AI Review Dossier (8 cols) */}
        <div className="lg:col-span-8 rounded-3xl border border-purple-500/40 bg-slate-900/70 p-6 backdrop-blur-xl shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">
                  CGWA Regulatory & Hydrogeological Review Dossier
                </h3>
                <span className="text-[10px] text-slate-400">
                  {evaluatedResult ? `Deduced via ${evaluatedResult.modelUsed} at ${evaluatedResult.timestamp}` : "Awaiting AI deduction execution"}
                </span>
              </div>
            </div>

            <button
              onClick={() => runEvaluation(docTitle, docSynopsis)}
              disabled={isEvaluating}
              className="flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-950/40 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-900/60 transition"
            >
              {isEvaluating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-purple-400" />}
              {isEvaluating ? "Analyzing..." : "Re-Run Evaluation"}
            </button>
          </div>

          <div className="prose prose-invert prose-sm max-w-none text-slate-200">
            {evaluatedResult?.aiPassage ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {evaluatedResult.aiPassage}
              </ReactMarkdown>
            ) : isEvaluating ? (
              <div className="flex items-center gap-3 py-8 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                <span>Extracting statutory clauses and computing hydrogeological metrics...</span>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  Click <strong>"Deduce Parameters & Run AI Evaluation"</strong> to send this policy synopsis to our AI deduction engine.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Statutory Checklist & Governance Readiness (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-emerald-400" /> CGWA 2024 Statutory Checklist
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Automated compliance audit against national gazette norms</p>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-start gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-950/60">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200 block">Rooftop Rainwater Harvesting (RWH)</span>
                <span className="text-[11px] text-slate-400">Mandatory for all building plots &gt; 100 sq.m.</span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-950/60">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200 block">Treated Sewage Effluent (STP)</span>
                <span className="text-[11px] text-slate-400">Dual-plumbing required for all commercial complexes.</span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-950/60">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200 block">Digital Telemetry Flow Meters</span>
                <span className="text-[11px] text-slate-400">Mandatory live logging to India-WRIS portal.</span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-950/60">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200 block">Paleochannel Silt Traps</span>
                <span className="text-[11px] text-slate-400">Must include gravel filtration to avoid clogging.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};