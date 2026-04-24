import type { NodeProps } from '@xyflow/react';
import { ClipboardList, User, Calendar } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { TaskNodeData } from '../../types/workflow';

export function TaskNode({ id, selected, data }: NodeProps) {
  const d = data as unknown as TaskNodeData;
  return (
    <BaseNode
      id={id}
      selected={!!selected}
      hasError={d.hasError}
      errorMessage={d.errorMessage}
      accentColor="bg-blue-500"
      icon={<ClipboardList size={12} />}
      label="Task"
      subtitle={d.title || 'Human task'}
    >
      <div className="space-y-1">
        {d.assignee && (
          <div className="flex items-center gap-1 text-[10px] text-slate-500">
            <User size={9} /> <span className="truncate">{d.assignee}</span>
          </div>
        )}
        {d.dueDate && (
          <div className="flex items-center gap-1 text-[10px] text-slate-500">
            <Calendar size={9} /> <span>{d.dueDate}</span>
          </div>
        )}
      </div>
    </BaseNode>
  );
}
