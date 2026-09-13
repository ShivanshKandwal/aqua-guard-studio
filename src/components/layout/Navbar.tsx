import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Droplets,
  Compass,
  Bot,
  ShieldAlert,
  Cpu,
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
    { role: "user", label: "User", icon: User },
    { role: "policy_maker", label: "Policy", icon: Building2 },
    { role: "developer", label: "Dev", icon: Terminal },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-700/80 bg-[#061229]/95 backdrop-blur-2xl shadow-xl w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Title */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-md shadow-cyan-500/30 group-hover:scale-105 transition-all">
            <Droplets className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                AquaSentinel
              </span>
              <span className="rounded-full bg-cyan-950 px-1.5 py-0.2 text-[9px] font-extrabold text-cyan-300 border border-cyan-700">
                2.0
              </span>
            </div>
          </div>
        </Link>

        {/* Center: Clean Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 rounded-xl border border-slate-700/80 bg-slate-900/80 p-1 shrink-0">
          {visibleNavLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/25 to-blue-600/30 text-cyan-200 border border-cyan-400/40 shadow-sm"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                <span className="whitespace-nowrap">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Controls: Compact Segmented Persona Switcher + District + Server */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Segmented Persona Toggle */}
          <div className="flex items-center rounded-xl border border-slate-700/80 bg-slate-950/90 p-0.5 shadow-inner">
            {roleOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = userRole === opt.role;
              return (
                <button
                  key={opt.role}
                  onClick={() => handleRoleChange(opt.role)}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-cyan-500/30 to-blue-600/30 text-cyan-200 border border-cyan-400/50 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                  title={`Switch to ${opt.label} Mode`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-cyan-400" : "text-slate-500"}`} />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* District Selector */}
          <div className="flex items-center rounded-xl border border-slate-700/80 bg-slate-900/90 px-2.5 py-1">
            <select
              value={selectedDistrictId}
              onChange={(e) => setSelectedDistrictId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-100 outline-none cursor-pointer max-w-[130px] sm:max-w-[160px] truncate"
            >
              {districts.map((d) => (
                <option key={d.id} value={d.id} className="bg-slate-900 text-slate-100">
                  {d.name} ({d.state})
                </option>
              ))}
            </select>
          </div>

          {/* Live Server Indicator Pill */}
          <div
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-mono font-bold border transition-colors ${
              isServerSynced
                ? "bg-emerald-950/60 border-emerald-700/80 text-emerald-300"
                : "bg-amber-950/60 border-amber-700/80 text-amber-300"
            }`}
            title={isServerSynced ? activeServerLabel : "Backend Offline"}
          >
            <span
              className={`h-2 w-2 rounded-full ${isServerSynced ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}
            />
            <span className="hidden sm:inline">{isServerSynced ? "Local FastAPI" : "Offline"}</span>
          </div>
        </div>
      </div>

      {/* Secondary Mobile/Tablet Links */}
      <div className="lg:hidden flex items-center justify-start border-t border-slate-800 bg-slate-950/95 px-3 py-1.5 overflow-x-auto gap-2">
        {visibleNavLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-cyan-500/25 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Icon className="h-3 w-3" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
};