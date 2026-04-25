import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Zap, History,
  ChevronLeft, ChevronRight, Plus, FlaskConical,
  Network
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { createWorkflow, saveWorkflow } from '../../api/workflows';
import { logActivity } from '../../api/activity';

const NAV = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Command Center' },
  { to: '/workflows',   icon: Network,         label: 'Pipelines' },
  { to: '/automations', icon: Zap,             label: 'Automations' },
  { to: '/logs',        icon: History,         label: 'System Logs' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [creatingNew, setCreatingNew] = useState(false);
  const [creatingPlayground, setCreatingPlayground] = useState(false);

  const handleCreatePipeline = async () => {
    if (creatingNew || creatingPlayground) return;
    setCreatingNew(true);
    try {
      const name = `New Pipeline ${new Date().toLocaleDateString()}`;
      const wf = await createWorkflow(name);
      await logActivity('created', `Created pipeline "${name}" from sidebar`, wf.id, name);
      toast.success('New pipeline created');
      navigate(`/workflows/${wf.id}/edit`);
    } catch {
      toast.error('Failed to create pipeline');
    } finally {
      setCreatingNew(false);
    }
  };

  const handleLaunchPlayground = async () => {
    if (creatingNew || creatingPlayground) return;
    setCreatingPlayground(true);
    try {
      const name = `Playground ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      const wf = await createWorkflow(name, 'Sandbox flow for trying ideas quickly');

      const nodes = [
        { id: 'start-node', type: 'startNode', position: { x: 260, y: 100 }, data: { type: 'startNode', title: 'Entry Point', metadata: [] } },
        { id: 'task-node', type: 'taskNode', position: { x: 260, y: 250 }, data: { type: 'taskNode', title: 'Sandbox Task', assignee: '{{ user.email }}', dueInDays: 2, fields: [] } },
        { id: 'end-node', type: 'endNode', position: { x: 260, y: 400 }, data: { type: 'endNode', endMessage: 'Playground complete', summaryFlag: false } },
      ];

      const edges = [
        { id: 'e-start-task', source: 'start-node', target: 'task-node' },
        { id: 'e-task-end', source: 'task-node', target: 'end-node' },
      ];

      await saveWorkflow(wf.id, nodes, edges);
      await logActivity('created', `Launched playground "${name}"`, wf.id, name);
      toast.success('Playground is ready');
      navigate(`/workflows/${wf.id}/edit`);
    } catch {
      toast.error('Failed to launch playground');
    } finally {
      setCreatingPlayground(false);
    }
  };

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

      {/* Main Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
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

      <div className={clsx('px-4 pb-6 border-t border-white/5 pt-4 space-y-2', collapsed && 'px-2')}>
        <button
          type="button"
          onClick={handleCreatePipeline}
          disabled={creatingNew || creatingPlayground}
          className={clsx(
            'w-full flex items-center gap-2.5 rounded-xl border border-violet-500/25 bg-violet-500/12 px-3 py-2.5 text-xs font-semibold text-violet-100 transition-colors hover:bg-violet-500/20 disabled:opacity-60 relative group',
            collapsed && 'justify-center px-0'
          )}
        >
          <Plus size={15} className="flex-shrink-0" />
          {!collapsed && <span>{creatingNew ? 'Creating...' : 'New Pipeline'}</span>}
          {collapsed && (
            <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#1a1a2e] text-white text-xs font-semibold rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-white/10 shadow-xl transition-all translate-x-[-10px] group-hover:translate-x-0">
              {creatingNew ? 'Creating...' : 'New Pipeline'}
            </div>
          )}
        </button>

        <button
          type="button"
          onClick={handleLaunchPlayground}
          disabled={creatingNew || creatingPlayground}
          className={clsx(
            'w-full flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-60 relative group',
            collapsed && 'justify-center px-0'
          )}
        >
          <FlaskConical size={15} className="flex-shrink-0" />
          {!collapsed && <span>{creatingPlayground ? 'Launching...' : 'Launch New Playground'}</span>}
          {collapsed && (
            <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#1a1a2e] text-white text-xs font-semibold rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-white/10 shadow-xl transition-all translate-x-[-10px] group-hover:translate-x-0">
              {creatingPlayground ? 'Launching...' : 'Launch New Playground'}
            </div>
          )}
        </button>
      </div>

    </aside>
  );
}
