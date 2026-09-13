import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Droplets,
  Compass,
  Bot,
  ShieldAlert,
  Cpu,
  Sparkles,
  FileCheck2,
  User,
  Building2,
  Terminal,
} from "lucide-react";
import { useStudioStore, type UserRole } from "../../lib/store/studio-store";

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    districts,
    selectedDistrictId,
    setSelectedDistrictId,
    activeModelId,
    setActiveModelId,
    isServerSynced,
    activeServerLabel,
    userRole,
    setUserRole,
  } = useStudioStore();

  const masterNavLinks = [
    { path: "/", label: "Studio & Map", icon: Compass, minRole: "user" },
    { path: "/assistant", label: "AI Advisor", icon: Bot, minRole: "user" },
    { path: "/policies", label: "Policies & Directives", icon: ShieldAlert, minRole: "user" },
    { path: "/policy-evaluator", label: "Policy Evaluator", icon: FileCheck2, minRole: "policy_maker" },
    { path: "/models", label: "Model Benchmarks", icon: Cpu, minRole: "developer" },
  ];

  const isLinkVisible = (minRole: string) => {
    if (minRole === "user") return true;
    if (minRole === "policy_maker") return userRole === "policy_maker" || userRole === "developer";
    if (minRole === "developer") return userRole === "developer";
    return true;
  };

  const visibleNavLinks = masterNavLinks.filter((link) => isLinkVisible(link.minRole));

  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    if (newRole === "user" && (location.pathname === "/policy-evaluator" || location.pathname === "/models")) {
      navigate("/");
    } else if (newRole === "policy_maker" && location.pathname === "/models") {
      navigate("/");
    }
  };

  const roleOptions: { role: UserRole; label: string; icon: any }[] = [
    { role: "user", label: "Normal User", icon: User },
    { role: "policy_maker", label: "Policy Maker", icon: Building2 },
    { role: "developer", label: "Developer", icon: Terminal },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-700/80 bg-[#061229]/95 backdrop-blur-2xl shadow-xl">
      <div className="mx-auto flex max-w-[1760px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8 gap-3 flex-wrap xl:flex-nowrap">
        {/* Brand Logo & Title */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/30 group-hover:scale-105 group-hover:shadow-cyan-400/40 transition-all duration-300">
            <Droplets className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                AquaSentinel
              </span>
              <span className="rounded-full bg-cyan-950 px-2 py-0.5 text-[11px] font-extrabold text-cyan-300 border border-cyan-700 shadow-sm">
                2.0
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium hidden sm:block">
              CGWB Groundwater Intelligence & Governance
            </p>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1.5 rounded-2xl border border-slate-700/80 bg-slate-900/80 p-1.5 shrink-0 shadow-inner">
          {visibleNavLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/25 to-blue-600/30 text-cyan-200 border border-cyan-400/40 shadow-md"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                <span className="whitespace-nowrap">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Bar: Compact, clean, zero-clipping */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* USER PERSONA SWITCHER */}
          <div className="flex items-center rounded-2xl border border-slate-700/80 bg-slate-950/90 p-1 shadow-inner">
            {roleOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = userRole === opt.role;
              return (
                <button
                  key={opt.role}
                  onClick={() => handleRoleChange(opt.role)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-cyan-500/30 to-blue-600/30 text-cyan-200 border border-cyan-400/50 shadow-md"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                  title={`Switch to ${opt.label} Mode`}
                >
                  <Icon className={`h-4 w-4 ${isSelected ? "text-cyan-400" : "text-slate-500"}`} />
                  <span className="hidden xl:inline">{opt.label}</span>
                  <span className="inline xl:hidden">{opt.label.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>

          {/* District Picker Dropdown */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/90 px-3 py-1.5 shadow-sm">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider hidden lg:inline">District:</span>
            <select
              value={selectedDistrictId}
              onChange={(e) => setSelectedDistrictId(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-100 outline-none cursor-pointer max-w-[150px] sm:max-w-[180px] truncate"
            >
              {districts.map((d) => (
                <option key={d.id} value={d.id} className="bg-slate-900 text-slate-100">
                  {d.name} ({d.state})
                </option>
              ))}
            </select>
          </div>

          {/* Model Switcher (Visible in Dev & Policy Modes) */}
          {userRole !== "user" && (
            <div className="hidden 2xl:flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/90 px-3 py-1.5 shadow-sm">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <select
                value={activeModelId}
                onChange={(e) => setActiveModelId(e.target.value)}
                className="bg-transparent text-sm font-semibold text-cyan-300 outline-none cursor-pointer"
              >
                <option value="xgboost-v1" className="bg-slate-900 text-slate-100">XGBoost Ensemble</option>
                <option value="lstm-v1" className="bg-slate-900 text-slate-100">LSTM Recurrent Net</option>
                <option value="linreg-v1" className="bg-slate-900 text-slate-100">Linear Regression</option>
              </select>
            </div>
          )}

          {/* Live Server Indicator Pill */}
          <div
            className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-mono font-bold border transition-colors shadow-sm ${
              isServerSynced
                ? "bg-emerald-950/60 border-emerald-700/80 text-emerald-300"
                : "bg-amber-950/60 border-amber-700/80 text-amber-300"
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${isServerSynced ? "bg-emerald-400 animate-ping" : "bg-amber-400"}`}
            />
            <span className="hidden sm:inline">{isServerSynced ? activeServerLabel : "Backend Offline"}</span>
            <span className="inline sm:hidden">{isServerSynced ? "Live" : "Offline"}</span>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-start border-t border-slate-800 bg-slate-950/95 px-3 py-2 overflow-x-auto gap-2">
        {visibleNavLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-cyan-500/25 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
};