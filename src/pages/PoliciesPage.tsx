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
  const [activeTab, setActiveTab] = useState<"directives" | "capex-comparison">("directives");

  // Comparative Capex vs Yield Data for Chart
  const capexComparisonData = policy.directives.map((d) => ({
    name: d.title.length > 22 ? d.title.slice(0, 20) + "..." : d.title,
    waterSavedMld: d.metrics.waterSavedMld,
    capexCrores: d.metrics.capexCrores,
    paybackYears: d.metrics.paybackPeriodYears,
  }));

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Immediate Mandate":
      case "High":
        return (
          <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold text-red-300 border border-red-500/30">
            Immediate Mandate
          </span>
        );
      case "Phased (6 Months)":
      case "Medium":
        return (
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-500/30">
            Phased (6M)
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-300 border border-cyan-500/30">
            Advisory
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
              <ShieldAlert className="h-3 w-3" /> CGWB Statutory Directives & Compliance Matrix
            </span>
            <span className="text-xs text-slate-400">District: {district.name} ({prediction.riskLevel})</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
            Groundwater Governance Hub & Official Directives
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-0.5">
            Explore official Central Ground Water Board mandates, statutory compliance checklists, and comparative CAPEX vs volumetric recovery benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/policy-evaluator"
            className="flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-950/40 px-3.5 py-2 text-xs font-semibold text-purple-300 hover:bg-purple-900/60 transition shadow-md shadow-purple-500/10"
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-400" /> Open Policy Evaluator
          </Link>
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

      {/* Note linking to dedicated Policy Evaluator */}
      <div className="rounded-2xl border border-purple-500/20 bg-purple-950/10 p-4 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-400 shrink-0" />
          <span>
            Need to evaluate a custom legislative draft or proposal? Use our dedicated <strong>Policy Evaluator</strong> tab with real-time Leaflet city-impact GIS mapping and multi-horizon trajectory graphs.
          </span>
        </div>
        <Link
          to="/policy-evaluator"
          className="shrink-0 rounded-xl bg-purple-600 px-3.5 py-1.5 font-semibold text-white hover:bg-purple-500 transition text-[11px]"
        >
          Go to Policy Evaluator →
        </Link>
      </div>
    </div>
  );
};
