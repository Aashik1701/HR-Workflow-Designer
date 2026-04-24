import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Zap, History,
  Settings, HelpCircle, ChevronLeft, ChevronRight,
  Network
} from 'lucide-react';
import clsx from 'clsx';

const NAV = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Command Center' },
  { to: '/workflows',   icon: Network,         label: 'Pipelines' },
  { to: '/automations', icon: Zap,             label: 'Automations' },
  { to: '/logs',        icon: History,         label: 'System Logs' },
];

const BOTTOM = [
  { to: '/settings', icon: Settings,   label: 'Settings' },
  { to: '/help',     icon: HelpCircle, label: 'Help' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={clsx(
      "border-r border-white/5 bg-[#080811] flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.5)]",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-6 w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] hover:bg-indigo-400 hover:scale-110 transition-all z-50 border-[3px] border-[#0f0f1a]"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Brand */}
      <div className={clsx("h-16 flex items-center gap-3 border-b border-white/5 transition-all px-5 mt-2", collapsed ? "justify-center px-0" : "")}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0">
          <Network size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden transition-all duration-300 whitespace-nowrap">
            <p className="text-[16px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 tracking-tight leading-tight">LogicFlow</p>
            <p className="text-[9px] text-sky-400 uppercase tracking-widest font-bold">Orchestrator</p>
          </div>
        )}
      </div>

      {/* User Context (Moved to top) */}
      <div className={clsx("px-4 pt-6 pb-3 transition-all", collapsed ? "px-2" : "")}>
        <div className={clsx(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors cursor-pointer group",
          collapsed ? "justify-center px-0" : ""
        )}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center text-[12px] font-extrabold flex-shrink-0 shadow-[0_0_15px_rgba(217,70,239,0.3)] text-white ring-2 ring-[#080811] group-hover:scale-105 transition-transform">
            MA
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-white truncate group-hover:text-fuchsia-100 transition-colors">Mohammed Aashik</p>
              <p className="text-[10px] text-fuchsia-400/80 font-medium tracking-wide">WORKSPACE ADMIN</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto custom-scrollbar">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => clsx(
              'flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm transition-all duration-200 group relative',
              isActive
                ? 'bg-indigo-500/15 text-indigo-400 font-semibold border border-indigo-500/20 shadow-inner'
                : 'text-white/40 hover:text-white/80 hover:bg-white/[0.03]'
            )}
          >
            <Icon size={18} className={clsx("flex-shrink-0 transition-transform group-hover:scale-110", collapsed && "mx-auto")} />
            {!collapsed && <span className="whitespace-nowrap">{label}</span>}
            
            {/* Tooltip for collapsed state */}
            {collapsed && (
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#1a1a2e] text-white text-xs font-semibold rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-white/10 shadow-xl transition-all translate-x-[-10px] group-hover:translate-x-0">
                {label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Nav */}
      <div className="px-4 pb-6 space-y-1.5 border-t border-white/5 pt-5">
        {BOTTOM.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className="flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm text-white/40 hover:text-white/80 hover:bg-white/[0.03] transition-all duration-200 group relative"
          >
            <Icon size={18} className={clsx("flex-shrink-0 transition-transform group-hover:scale-110", collapsed && "mx-auto")} />
            {!collapsed && <span className="whitespace-nowrap">{label}</span>}

            {collapsed && (
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#1a1a2e] text-white text-xs font-semibold rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-white/10 shadow-xl transition-all translate-x-[-10px] group-hover:translate-x-0">
                {label}
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
