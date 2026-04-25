import type { Node, NodeProps } from '@xyflow/react';
import { Play } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { StartNodeData } from '../../types/workflow';

type StartFlowNode = Node<StartNodeData, 'startNode'>;

export function StartNode({ id, selected, data }: NodeProps<StartFlowNode>) {
  const d = data;
  return (
    <BaseNode
      id={id}
      selected={!!selected}
      hasError={d.hasError}
      errorMessage={d.errorMessage}
      accentGradient="from-emerald-400 to-teal-500"
      accentText="text-emerald-300"
      accentPill="bg-emerald-500/15 border border-emerald-500/20"
      bgGradient="bg-gradient-to-br from-emerald-500/10 to-[#181828]"
      borderGlow="border border-emerald-500/20"
      icon={<Play size={13} />}
      label={d.title || 'Start'}
      typeLabel="Trigger"
      subtitle={d.triggerType ? `on: ${d.triggerType}` : 'Workflow entry point'}
      showTargetHandle={false}
    >
      {d.metadata?.length > 0 && (
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
          <p className="text-[10px] text-white/40">{d.metadata.length} metadata key{d.metadata.length > 1 ? 's' : ''}</p>
        </div>
      )}
    </BaseNode>
  );
}
