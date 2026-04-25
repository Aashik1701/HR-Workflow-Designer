import { Play, ClipboardList, CheckCircle2, Zap, Flag, GitBranch, Clock, Webhook, Sparkles, GitFork, Repeat, FileText } from 'lucide-react';
import type { NodeType } from '../../types/workflow';
import clsx from 'clsx';

interface NodePaletteItem {
  type: NodeType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const PALETTE: NodePaletteItem[] = [
  { type: 'startNode',          label: 'Start',          description: 'Entry point',          icon: <Play size={14} />,           color: 'bg-emerald-500' },
  { type: 'webhookNode',        label: 'Webhook',        description: 'External trigger',     icon: <Webhook size={14} />,        color: 'bg-orange-500' },
  { type: 'taskNode',           label: 'Task',           description: 'Human task',           icon: <ClipboardList size={14} />,   color: 'bg-blue-500' },
  { type: 'approvalNode',       label: 'Approval',       description: 'Approval step',        icon: <CheckCircle2 size={14} />,   color: 'bg-amber-500' },
  { type: 'automatedStepNode',  label: 'Automated Step', description: 'System action',        icon: <Zap size={14} />,            color: 'bg-purple-500' },
  { type: 'aiActionNode',       label: 'AI Action',      description: 'LLM processing',       icon: <Sparkles size={14} />,       color: 'bg-violet-500' },
  { type: 'splitNode',          label: 'Split Flow',     description: 'A/B routing',          icon: <GitBranch size={14} />,      color: 'bg-cyan-500' },
  { type: 'forkNode',           label: 'Fork / Join',    description: 'Parallel execution',   icon: <GitFork size={14} />,        color: 'bg-pink-500' },
  { type: 'loopNode',           label: 'Loop',           description: 'Iterate over list',    icon: <Repeat size={14} />,         color: 'bg-yellow-500' },
  { type: 'documentGenNode',    label: 'Document Gen',   description: 'Create documents',     icon: <FileText size={14} />,       color: 'bg-cyan-500' },
  { type: 'delayNode',          label: 'Wait',           description: 'Time delay',           icon: <Clock size={14} />,          color: 'bg-slate-500' },
  { type: 'endNode',            label: 'End',            description: 'Workflow completion',   icon: <Flag size={14} />,           color: 'bg-rose-500' },
];

interface NodeSidebarProps {
  dark?: boolean;
}

export function NodeSidebar({ dark }: NodeSidebarProps) {
  const onDragStart = (e: React.DragEvent, type: NodeType) => {
    e.dataTransfer.setData('application/reactflow-type', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className={clsx('w-52 border-r flex flex-col flex-shrink-0', dark ? 'bg-[#0d0d18] border-white/5' : 'bg-white border-slate-200')}>
      <div className={clsx('p-4 border-b', dark ? 'border-white/5' : 'border-slate-100')}>
        <h2 className={clsx('text-xs font-semibold uppercase tracking-wider', dark ? 'text-white/50' : 'text-slate-500')}>
          Node Palette
        </h2>
        <p className={clsx('text-[10px] mt-0.5', dark ? 'text-white/30' : 'text-slate-400')}>
          Drag nodes onto the canvas
        </p>
      </div>
      <div className="p-3 space-y-2 overflow-y-auto flex-1">
        {PALETTE.map(item => (
          <div
            key={item.type}
            draggable
            onDragStart={e => onDragStart(e, item.type)}
            className={clsx(
              'flex items-center gap-2 p-2.5 rounded-lg border cursor-grab active:cursor-grabbing transition-all',
              dark
                ? 'bg-white/5 border-white/5 hover:border-blue-500/30 hover:bg-white/10'
                : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
            )}
          >
            <div className={`p-1.5 rounded-md ${item.color} text-white flex-shrink-0`}>
              {item.icon}
            </div>
            <div className="min-w-0">
              <p className={clsx('text-xs font-medium', dark ? 'text-white/80' : 'text-slate-700')}>{item.label}</p>
              <p className={clsx('text-[10px]', dark ? 'text-white/30' : 'text-slate-400')}>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
