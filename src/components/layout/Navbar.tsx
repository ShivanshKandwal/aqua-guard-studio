import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Droplets, Compass, Bot, ShieldAlert, Cpu, Sparkles } from "lucide-react";
import { useStudioStore } from "../../lib/store/studio-store";

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { districts, selectedDistrictId, setSelectedDistrictId, activeModelId, setActiveModelId } = useStudioStore();

  const navLinks = [
    { path: "/", label: "Studio & Map", icon: Compass },
    { path: "/assistant", label: "AI Advisor", icon: Bot },
    { path: "/policies", label: "Policies & Directives", icon: ShieldAlert },
    { path: "/models", label: "Model Benchmarks", icon: Cpu },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#060913]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3.5 sm:px-8 lg:px-10">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3.5 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 via-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform duration-200">
            <Droplets className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-cyan-300 transition-colors">AquaGuard</span>
              <span className="rounded-full bg-cyan-950/80 px-2 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-800/70 shadow-sm">
                STUDIO 2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Groundwater Intelligence • CGWB NCR</p>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 rounded-xl border border-slate-800/80 bg-slate-900/60 p-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Global Selectors */}
        <div className="flex items-center gap-3">
          {/* District Picker */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5">
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">District:</span>
            <select
              value={selectedDistrictId}
              onChange={(e) => setSelectedDistrictId(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-200 outline-none cursor-pointer"
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
          <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 px-2.5 py-1 text-[11px] font-mono text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>FastAPI ML: Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};
