import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Droplets, Compass, Bot, ShieldAlert, Cpu, Sparkles, FileCheck2 } from "lucide-react";
import { useStudioStore } from "../../lib/store/studio-store";

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { districts, selectedDistrictId, setSelectedDistrictId, activeModelId, setActiveModelId } = useStudioStore();

  const navLinks = [
    { path: "/", label: "Studio & Map", icon: Compass },
    { path: "/assistant", label: "AI Advisor", icon: Bot },
    { path: "/policy-evaluator", label: "Policy Evaluator", icon: FileCheck2 },
    { path: "/policies", label: "Policies & Directives", icon: ShieldAlert },
    { path: "/models", label: "Model Benchmarks", icon: Cpu },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#060913]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1680px] items-center justify-between px-3 py-2.5 sm:px-6 lg:px-8 gap-3">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/25 group-hover:scale-105 transition-transform duration-200">
            <Droplets className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white group-hover:text-cyan-300 transition-colors">AquaGuard</span>
              <span className="rounded-full bg-cyan-950/80 px-1.5 py-0.2 text-[9px] font-bold text-cyan-400 border border-cyan-800/70 shadow-sm">
                2.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">CGWB Groundwater Intelligence</p>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="flex items-center gap-1 rounded-xl border border-slate-800/80 bg-slate-900/60 p-1 shrink-0">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="whitespace-nowrap">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Global Selectors */}
        <div className="flex items-center gap-2 shrink-0">
          {/* District Picker */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2 py-1.5">
            <span className="text-[10px] text-slate-500 font-medium hidden md:inline">District:</span>
            <select
              value={selectedDistrictId}
              onChange={(e) => setSelectedDistrictId(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-200 outline-none cursor-pointer max-w-[140px] sm:max-w-none truncate"
            >
              {districts.map((d) => (
                <option key={d.id} value={d.id} className="bg-slate-900 text-slate-100">
                  {d.name} ({d.state})
                </option>
              ))}
            </select>
          </div>

          {/* Model Switcher */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5">
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <select
              value={activeModelId}
              onChange={(e) => setActiveModelId(e.target.value)}
              className="bg-transparent text-xs font-medium text-cyan-300 outline-none cursor-pointer"
            >
              <option value="xgboost-v1" className="bg-slate-900 text-slate-100">XGBoost Ensemble</option>
              <option value="lstm-v1" className="bg-slate-900 text-slate-100">LSTM Recurrent Net</option>
              <option value="linreg-v1" className="bg-slate-900 text-slate-100">Linear Regression</option>
            </select>
          </div>

          {/* Live Server Indicator */}
          <div className={`hidden sm:flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-mono border ${
            isServerSynced
              ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-400"
              : "bg-amber-950/40 border-amber-800/60 text-amber-300"
          }`}>
            <span className={`h-2 w-2 rounded-full ${isServerSynced ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
            <span>{isServerSynced ? activeServerLabel : "Backend: Offline"}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
