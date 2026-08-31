import React, { useState } from "react";
import { useStudioStore } from "../lib/store/studio-store";
import { analyzeCustomPolicyDocument, type CustomPolicyEvaluation } from "../lib/policy/policy-engine";
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Droplets,
  Banknote,
  FileText,
  Sliders,
  UploadCloud,
  FileCode,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Activity,
  Award,
  Zap,
  Leaf,
  Layers,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";
import { Link } from "react-router-dom";

export const PoliciesPage: React.FC = () => {
  const { getCurrentDistrict, getPrediction, getPolicyEvaluation } = useStudioStore();
  const district = getCurrentDistrict();
  const prediction = getPrediction();
  const policy = getPolicyEvaluation();

  // Accordion & View State
  const [expandedPolicyId, setExpandedPolicyId] = useState<string | null>("pol-borewell-ban");
  const [activeTab, setActiveTab] = useState<"directives" | "custom-eval" | "capex-comparison">("directives");

  // Custom PDF/Synopsis Upload Form State
  const [docTitle, setDocTitle] = useState("Delhi Aquifer Rejuvenation & Sponge City Draft 2026");
  const [docSnippet, setDocSnippet] = useState(
    "Policy Proposal: Mandate mandatory deep-shaft rainwater harvesting injection wells along arterial Yamuna floodplains and industrial corridors. Replace all groundwater draft for commercial HVAC cooling with tertiary treated sewage effluent from Coronation Pillar STP. Impose progressive volumetric extraction cess on bulk commercial users with IoT telemetry meters."
  );
  const [customAnalysis, setCustomAnalysis] = useState<CustomPolicyEvaluation | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyzeCustomDoc = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const evaluation = analyzeCustomPolicyDocument(docTitle, docSnippet, district);
      setCustomAnalysis(evaluation);
      setIsAnalyzing(false);
      setActiveTab("custom-eval");
    }, 600);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "IMMEDIATE_EMERGENCY":
        return <span className="rounded-md bg-red-950 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-400 border border-red-800">Immediate Emergency</span>;
      case "HIGH_REGULATORY":
        return <span className="rounded-md bg-amber-950 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-amber-800">High Regulatory</span>;
      case "MEDIUM_INCENTIVE":
        return <span className="rounded-md bg-blue-950 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-400 border border-blue-800">Incentive Driven</span>;
      default:
        return <span className="rounded-md bg-emerald-950 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-800">Sustainability Norm</span>;
    }
  };

  // Comparative Capex vs Yield Data for Chart
  const capexComparisonData = policy.directives.map((d) => ({
    name: d.title.length > 22 ? d.title.slice(0, 20) + "..." : d.title,
    waterSavedMld: d.metrics.waterSavedMld,
    capexCrores: d.metrics.capexCrores,
    paybackYears: d.metrics.paybackPeriodYears,
  }));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
              <ShieldAlert className="h-3 w-3" /> CGWB Statutory Directives & AI Policy Sandbox
            </span>
            <span className="text-xs text-slate-400">District: {district.name} ({prediction.riskLevel})</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
            Groundwater Governance Hub & Custom Policy Evaluator
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-0.5">
            Evaluate official CGWB mandates, compare CAPEX yields, or paste custom policy synopses/PDF extracts to generate instant multi-year impact trajectories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            <Sliders className="h-3.5 w-3.5 text-cyan-400" /> Adjust Metrics in Studio
          </Link>
        </div>
      </div>

      {/* Top Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 p-1">
          <button
            onClick={() => setActiveTab("directives")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "directives"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="h-3.5 w-3.5" /> Triggered Directives ({policy.directives.length})
          </button>
          <button
            onClick={() => setActiveTab("capex-comparison")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "capex-comparison"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Banknote className="h-3.5 w-3.5" /> CAPEX & Yield Matrix
          </button>
          <button
            onClick={() => setActiveTab("custom-eval")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "custom-eval"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UploadCloud className="h-3.5 w-3.5" /> Custom Policy Sandbox {customAnalysis && "✓"}
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
          <span>Net Water Yield: <strong className="text-emerald-400">{policy.totalWaterSavingsMld} MLD</strong></span>
          <span>•</span>
          <span>CAPEX: <strong className="text-purple-300">₹{policy.totalCapexCrores} Cr</strong></span>
        </div>
      </div>

      {/* VIEW 1: TRIGGERED DIRECTIVES ACCORDION WITH DEEP ANALYSIS */}
      {activeTab === "directives" && (
        <div className="space-y-4">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Active Directives</span>
                <FileText className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="mt-2 font-display text-2xl font-bold text-slate-100">
                {policy.directives.length} Mandates
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Calibrated to {district.name}</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Total Water Recovery</span>
                <Droplets className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-2 font-display text-2xl font-bold text-emerald-400">
                {policy.totalWaterSavingsMld} MLD
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Million Liters per Day</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Total Infrastructure Budget</span>
                <Banknote className="h-4 w-4 text-purple-400" />
              </div>
              <div className="mt-2 font-display text-2xl font-bold text-purple-300">
                ₹{policy.totalCapexCrores} Cr
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Municipal & Private Outlay</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>CO₂ Abatement</span>
                <Leaf className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-2 font-display text-2xl font-bold text-emerald-400">
                {policy.totalCo2ReductionTonnes} t/yr
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Reduced pumping power emissions</p>
            </div>
          </div>

          {/* Directives Deep Breakdown Accordion */}
          <div className="space-y-4">
            {policy.directives.map((directive) => {
              const isExpanded = expandedPolicyId === directive.id;

              return (
                <div
                  key={directive.id}
                  className={`rounded-2xl border transition-all shadow-xl ${
                    isExpanded
                      ? "border-emerald-500/50 bg-slate-900/90 shadow-emerald-500/5 ring-1 ring-emerald-500/30"
                      : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                  }`}
                >
                  {/* Accordion Trigger Header */}
                  <div
                    onClick={() => setExpandedPolicyId(isExpanded ? null : directive.id)}
                    className="flex cursor-pointer items-center justify-between p-5"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-emerald-400 border border-slate-700">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-base text-slate-100">{directive.title}</h3>
                          {getPriorityBadge(directive.priority)}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Category: <span className="text-slate-300 font-medium">{directive.category}</span> • Lead Agency: <span className="text-cyan-300">{directive.leadAgency}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex flex-col items-end text-right text-xs">
                        <span className="font-mono font-bold text-emerald-400">+{directive.metrics.waterSavedMld} MLD</span>
                        <span className="text-[11px] text-slate-400">₹{directive.metrics.capexCrores} Cr</span>
                      </div>
                      <div className="rounded-lg bg-slate-800 p-1.5 text-slate-400">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded In-Depth Policy Dossier */}
                  {isExpanded && (
                    <div className="border-t border-slate-800/80 px-5 pb-5 pt-4 space-y-4 text-xs sm:text-sm">
                      {/* Description & Statutory Basis */}
                      <div className="rounded-xl bg-slate-950/70 p-4 border border-slate-800/80 space-y-2">
                        <p className="text-slate-200 leading-relaxed">{directive.description}</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-cyan-400 font-mono">
                          <Award className="h-3.5 w-3.5" />
                          Statutory Framework: {directive.statutoryBasis}
                        </div>
                      </div>

                      {/* Detailed Metric Dossier Table */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Target Water Yield</span>
                          <span className="font-mono text-base font-bold text-emerald-400">{directive.metrics.waterSavedMld} MLD</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Million Liters/Day</span>
                        </div>
                        <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Estimated CAPEX</span>
                          <span className="font-mono text-base font-bold text-purple-300">₹{directive.metrics.capexCrores} Cr</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Payback: {directive.metrics.paybackPeriodYears} yrs</span>
                        </div>
                        <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Aquifer Recharge</span>
                          <span className="font-mono text-base font-bold text-cyan-300">{directive.metrics.aquiferRechargeHam} HAM</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Hectare Meters/yr</span>
                        </div>
                        <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Compliance Window</span>
                          <span className="font-mono text-base font-bold text-amber-300">{directive.metrics.complianceDeadlineMonths} Months</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">OPEX: ₹{directive.metrics.opexAnnualLakhs} L/yr</span>
                        </div>
                      </div>

                      {/* Action items & Execution Checklist */}
                      <div>
                        <h4 className="font-semibold text-xs text-slate-300 uppercase tracking-wider mb-2">
                          Operational Execution Protocol:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {directive.actionItems.map((action, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 rounded-xl bg-slate-950/60 p-3 border border-slate-800/60">
                              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="text-xs text-slate-300 leading-snug">{action}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Risk Assessment & Stakeholders */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        <div className="rounded-xl border border-red-900/30 bg-red-950/20 p-3 text-xs">
                          <span className="font-bold text-red-400 flex items-center gap-1.5 mb-1">
                            <AlertTriangle className="h-3.5 w-3.5" /> Non-Compliance Hydrogeological Risk:
                          </span>
                          <p className="text-slate-300 text-[11px] leading-relaxed">{directive.riskIfIgnored}</p>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs">
                          <span className="font-bold text-slate-300 flex items-center gap-1.5 mb-1">
                            <Layers className="h-3.5 w-3.5 text-cyan-400" /> Key Interlocking Stakeholders:
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {directive.stakeholders.map((s, idx) => (
                              <span key={idx} className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 font-medium">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: CAPEX & WATER YIELD COMPARATIVE MATRIX */}
      {activeTab === "capex-comparison" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
              <div>
                <h3 className="font-semibold text-base text-slate-100">
                  Policy Capital Allocation vs Daily Water Savings (MLD)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Comparative efficiency analysis showing volumetric yield (MLD) on left axis and CAPEX outlay (₹ Crores) on right axis.
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400">Dual Axis Scaled</span>
            </div>

            <div className="h-80 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={capexComparisonData} margin={{ top: 15, right: 20, left: -10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis yAxisId="mld" stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: "Water Saved (MLD)", angle: -90, position: "insideLeft", fontSize: 10, fill: "#10b981" }} />
                  <YAxis yAxisId="capex" orientation="right" stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: "CAPEX (₹ Cr)", angle: 90, position: "insideRight", fontSize: 10, fill: "#a855f7" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#090e24", borderColor: "#1e293b", borderRadius: "0.75rem", fontSize: "12px", color: "#f8fafc" }}
                    formatter={(val: any, name: string) => {
                      if (name === "Water Saved (MLD)") return [`${val} MLD`, name];
                      if (name === "CAPEX Outlay (₹ Crores)") return [`₹${val} Crores`, name];
                      if (name === "Payback Horizon (Years)") return [`${val} Years`, name];
                      return [val, name];
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "15px" }} />
                  <Bar yAxisId="mld" name="Water Saved (MLD)" dataKey="waterSavedMld" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="capex" name="CAPEX Outlay (₹ Crores)" dataKey="capexCrores" fill="#a855f7" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="mld" name="Payback Horizon (Years)" dataKey="paybackYears" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: CUSTOM PDF / SYNOPSIS POLICY EVALUATOR SANDBOX */}
      {activeTab === "custom-eval" && (
        <div className="space-y-6">
          {/* Document Input Console */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md shadow-xl space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-purple-400" />
                <h3 className="font-semibold text-base text-slate-100">
                  Custom Policy / PDF Synopsis AI Evaluator
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Paste the synopsis, executive summary, or PDF text of a proposed policy to simulate its potential MLD yield, capital outlay, and 8-year aquifer rebound trajectory.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Policy Document Title
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs sm:text-sm text-slate-100 focus:border-purple-500 focus:outline-none"
                  placeholder="e.g. Yamuna Aquifer Rejuvenation Directive 2026"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Policy Executive Synopsis / PDF Content
                </label>
                <textarea
                  rows={4}
                  value={docSnippet}
                  onChange={(e) => setDocSnippet(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs text-slate-200 focus:border-purple-500 focus:outline-none leading-relaxed"
                  placeholder="Paste policy clauses, regulatory frameworks, RWH mandates, effluent targets..."
                />
              </div>

              <button
                onClick={handleAnalyzeCustomDoc}
                disabled={isAnalyzing || !docSnippet.trim()}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 shadow-lg shadow-purple-500/20"
              >
                <Sparkles className="h-4 w-4" />
                {isAnalyzing ? "Simulating Hydrogeological Trajectory..." : "Run AI Policy Impact Simulation"}
              </button>
            </div>
          </div>

          {/* Evaluation Results Dossier */}
          {customAnalysis && (
            <div className="rounded-2xl border border-purple-500/40 bg-slate-900/80 p-6 backdrop-blur-md shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-purple-500/20 px-2 py-0.5 text-xs font-bold text-purple-300 border border-purple-500/30">
                      Simulation Dossier: {customAnalysis.sourceTitle}
                    </span>
                    <span className="text-xs text-slate-400">Target Aquifer: {district.name}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">
                    AI Feasibility & Multi-Year Water Rebound Analysis
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-slate-950 px-3 py-1.5 border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400">Readiness Score</div>
                    <div className="font-mono text-base font-bold text-purple-300">{customAnalysis.readinessScore}/100</div>
                  </div>
                  <div className="rounded-xl bg-slate-950 px-3 py-1.5 border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400">Feasibility</div>
                    <div className="font-mono text-base font-bold text-emerald-400">{customAnalysis.feasibilityRating}</div>
                  </div>
                </div>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-xl bg-slate-950/80 p-3.5 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Estimated Water Yield</span>
                  <span className="font-mono text-xl font-bold text-emerald-400">{customAnalysis.estimatedNetWaterRecoveryMld} MLD</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Daily Aquifer Relief</span>
                </div>
                <div className="rounded-xl bg-slate-950/80 p-3.5 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Estimated Budget</span>
                  <span className="font-mono text-xl font-bold text-purple-300">₹{customAnalysis.estimatedBudgetCrores} Cr</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">CAPEX Outlay</span>
                </div>
                <div className="rounded-xl bg-slate-950/80 p-3.5 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">CGWA Norms Alignment</span>
                  <span className="font-mono text-xl font-bold text-cyan-300">{customAnalysis.regulatoryAlignment.cgwaNormsMatchPct}%</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Compliance Match</span>
                </div>
                <div className="rounded-xl bg-slate-950/80 p-3.5 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">8-Year Water Table Rebound</span>
                  <span className="font-mono text-xl font-bold text-emerald-300">
                    +{customAnalysis.impactTrajectory[customAnalysis.impactTrajectory.length - 1].aquiferLevelReboundM}m
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Estimated Rebound</span>
                </div>
              </div>

              {/* 8-Year Simulated Impact Trajectory Chart */}
              <div className="rounded-xl bg-slate-950/90 p-4 border border-slate-800">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-semibold text-slate-200">
                    Simulated 8-Year Cumulative Water Recovery & Aquifer Rebound Trajectory
                  </span>
                  <span className="text-cyan-400 font-mono text-[11px]">2026–2033 Multi-Year Projection</span>
                </div>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={customAnalysis.impactTrajectory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="reboundGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#090e24", borderColor: "#1e293b", borderRadius: "0.75rem", fontSize: "12px", color: "#f8fafc" }}
                        formatter={(val: any, name: string) => {
                          if (name === "cumulativeWaterSavedMld") return [`${val} MLD`, "Cumulative Recovery"];
                          if (name === "aquiferLevelReboundM") return [`+${val} m`, "Water Table Rebound"];
                          return [val, name];
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} />
                      <Area type="monotone" name="Cumulative Water Saved (MLD)" dataKey="cumulativeWaterSavedMld" stroke="#a855f7" strokeWidth={2.5} fillOpacity={1} fill="url(#reboundGrad)" />
                      <Line type="monotone" name="Aquifer Rebound (+m)" dataKey="aquiferLevelReboundM" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Strategic SWOT & Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Strengths */}
                <div className="rounded-xl border border-emerald-900/30 bg-emerald-950/20 p-4 space-y-2">
                  <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Strategic Strengths:
                  </h4>
                  <ul className="space-y-1.5 text-slate-300">
                    {customAnalysis.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Vulnerabilities */}
                <div className="rounded-xl border border-amber-900/30 bg-amber-950/20 p-4 space-y-2">
                  <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" /> Implementation Challenges:
                  </h4>
                  <ul className="space-y-1.5 text-slate-300">
                    {customAnalysis.vulnerabilities.map((v, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-400">•</span>
                        <span>{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div className="rounded-xl border border-cyan-900/30 bg-cyan-950/20 p-4 space-y-2">
                  <h4 className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> Policy Optimization Tips:
                  </h4>
                  <ul className="space-y-1.5 text-slate-300">
                    {customAnalysis.strategicRecommendations.map((r, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-cyan-400">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
