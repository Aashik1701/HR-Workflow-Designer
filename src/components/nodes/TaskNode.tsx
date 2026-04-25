import type { Node, NodeProps } from '@xyflow/react';
import { ClipboardList, User, Calendar } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { TaskNodeData } from '../../types/workflow';

type TaskFlowNode = Node<TaskNodeData, 'taskNode'>;

export function TaskNode({ id, selected, data }: NodeProps<TaskFlowNode>) {
  const d = data;
  return (
    <BaseNode
      id={id}
      selected={!!selected}
      hasError={d.hasError}
      errorMessage={d.errorMessage}
      accentGradient="from-sky-400 to-blue-500"
      accentText="text-sky-300"
      accentPill="bg-sky-500/15 border border-sky-500/20"
      bgGradient="bg-gradient-to-br from-sky-500/10 to-[#181828]"
      borderGlow="border border-sky-500/20"
      icon={<ClipboardList size={13} />}
      label={d.title || 'Task'}
      typeLabel="Human Task"
      subtitle={d.description || 'Manual step'}
    >
      <div className="space-y-1.5">
        {d.assignee && (
          <div className="flex items-center gap-1.5 text-[10px] text-white/55">
            <User size={9} className="text-sky-400/70 flex-shrink-0" />
            <span className="truncate font-mono">{d.assignee}</span>
          </div>
        )}
        {d.dueDate && (
          <div className="flex items-center gap-1.5 text-[10px] text-white/40">
            <Calendar size={9} className="flex-shrink-0" />
            <span>{d.dueDate}</span>
          </div>
        )}
      </div>
    </BaseNode>
  );
}
