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

  // Define master nav links with minimum allowed role
  // 1-user: Studio & Map, AI Advisor, Policies & Directives (3 pages)
  // 2-policy_maker: adds Policy Evaluator (4 pages)
  // 3-developer: adds Model Benchmarks (5 pages)
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
    // If current path becomes inaccessible under the new role, gracefully redirect to "/"
    if (newRole === "user" && (location.pathname === "/policy-evaluator" || location.pathname === "/models")) {
      navigate("/");
    } else if (newRole === "policy_maker" && location.pathname === "/models") {
      navigate("/");
    }
  };

  const roleOptions: { role: UserRole; label: string; shortLabel: string; icon: any }[] = [
    { role: "user", label: "Normal User", shortLabel: "User", icon: User },
    { role: "policy_maker", label: "Policy Maker", shortLabel: "Policy", icon: Building2 },
    { role: "developer", label: "Developer", shortLabel: "Dev", icon: Terminal },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#060913]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1720px] items-center justify-between px-3 py-2.5 sm:px-6 lg:px-8 gap-3">
        {/* Brand Rebranded to AquaSentinel */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-md shadow-cyan-500/25 group-hover:scale-105 transition-transform duration-200">
            <Droplets className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                AquaSentinel
              </span>
              <span className="rounded-full bg-cyan-950/80 px-1.5 py-0.2 text-[9px] font-bold text-cyan-400 border border-cyan-800/70 shadow-sm">
                2.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
              CGWB Groundwater Intelligence & Governance
            </p>
          </div>
        </Link>

        {/* Center Nav Links (Filtered dynamically by persona) */}
        <nav className="hidden md:flex items-center gap-1 rounded-xl border border-slate-800/80 bg-slate-900/60 p-1 shrink-0">
          {visibleNavLinks.map((link) => {
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

        {/* Right Controls: Role Toggle, District Selector, Model Switcher & Telemetry */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* USER MODE TOGGLE (Segmented Pill) */}
          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950/80 p-0.5 shadow-inner">
            {roleOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = userRole === opt.role;
              return (
                <button
                  key={opt.role}
                  onClick={() => handleRoleChange(opt.role)}
                  className={`flex items-center gap-1.5 rounded-lg px-2 sm:px-2.5 py-1 text-xs font-medium transition-all duration-200 ${
                    isSelected
                      ? "bg-gradient-to-r from-cyan-500/25 to-blue-600/25 text-cyan-300 border border-cyan-500/40 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`}
                  title={`Switch to ${opt.label} Mode`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-cyan-400" : "text-slate-500"}`} />
                  <span className="hidden xl:inline">{opt.label}</span>
                  <span className="inline xl:hidden text-[11px]">{opt.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {/* District Picker */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2 py-1.5">
            <span className="text-[10px] text-slate-500 font-medium hidden lg:inline">District:</span>
            <select
              value={selectedDistrictId}
              onChange={(e) => setSelectedDistrictId(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-200 outline-none cursor-pointer max-w-[120px] sm:max-w-[150px] truncate"
            >
              {districts.map((d) => (
                <option key={d.id} value={d.id} className="bg-slate-900 text-slate-100">
                  {d.name} ({d.state})
                </option>
              ))}
            </select>
          </div>

          {/* Model Switcher (Visible to Developers & Policy Makers) */}
          {userRole !== "user" && (
            <div className="hidden lg:flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2 py-1.5">
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
          )}

          {/* Live Server Indicator */}
          <div
            className={`hidden sm:flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-mono border ${
              isServerSynced
                ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-400"
                : "bg-amber-950/40 border-amber-800/60 text-amber-300"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${isServerSynced ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}
            />
            <span>{isServerSynced ? activeServerLabel : "Backend: Offline"}</span>
          </div>
        </div>
      </div>

      {/* Mobile Secondary Sub-navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/60 bg-slate-950/90 px-2 py-1.5 overflow-x-auto gap-1">
        {visibleNavLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200"
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