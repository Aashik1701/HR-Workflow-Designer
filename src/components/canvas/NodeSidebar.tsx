import { Play, ClipboardList, CheckCircle2, Zap, Flag } from 'lucide-react';
import type { NodeType } from '../../types/workflow';

interface NodePaletteItem {
  type: NodeType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const PALETTE: NodePaletteItem[] = [
  { type: 'startNode',          label: 'Start',          description: 'Entry point',         icon: <Play size={14} />,           color: 'bg-emerald-500' },
  { type: 'taskNode',           label: 'Task',           description: 'Human task',           icon: <ClipboardList size={14} />,  color: 'bg-blue-500' },
  { type: 'approvalNode',       label: 'Approval',       description: 'Approval step',        icon: <CheckCircle2 size={14} />,   color: 'bg-amber-500' },
  { type: 'automatedStepNode',  label: 'Automated Step', description: 'System action',        icon: <Zap size={14} />,            color: 'bg-purple-500' },
  { type: 'endNode',            label: 'End',            description: 'Workflow completion',  icon: <Flag size={14} />,           color: 'bg-rose-500' },
];

export function NodeSidebar() {
  const onDragStart = (e: React.DragEvent, type: NodeType) => {
    e.dataTransfer.setData('application/reactflow-type', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-52 border-r border-slate-200 bg-white flex flex-col">
      <div className="p-4 border-b border-slate-100">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Node Palette</h2>
        <p className="text-[10px] text-slate-400 mt-0.5">Drag nodes onto the canvas</p>
      </div>
      <div className="p-3 space-y-2 overflow-y-auto flex-1">
        {PALETTE.map(item => (
          <div
            key={item.type}
            draggable
            onDragStart={e => onDragStart(e, item.type)}
            className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white cursor-grab
                       hover:border-indigo-300 hover:shadow-sm active:cursor-grabbing transition-all group"
          >
            <div className={`p-1.5 rounded-md ${item.color} text-white flex-shrink-0`}>
              {item.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-700">{item.label}</p>
              <p className="text-[10px] text-slate-400">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
