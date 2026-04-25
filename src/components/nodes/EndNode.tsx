import type { Node, NodeProps } from '@xyflow/react';
import { Flag, CheckCircle2 } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { EndNodeData } from '../../types/workflow';

type EndFlowNode = Node<EndNodeData, 'endNode'>;

export function EndNode({ id, selected, data }: NodeProps<EndFlowNode>) {
  const d = data;
  return (
    <BaseNode
      id={id}
      selected={!!selected}
      hasError={d.hasError}
      errorMessage={d.errorMessage}
      accentGradient="from-rose-400 to-pink-500"
      accentText="text-rose-300"
      accentPill="bg-rose-500/15 border border-rose-500/20"
      bgGradient="bg-gradient-to-br from-rose-500/10 to-[#181828]"
      borderGlow="border border-rose-500/20"
      icon={<Flag size={13} />}
      label="End"
      typeLabel="Terminal"
      subtitle={d.endMessage || 'Workflow complete'}
      showSourceHandle={false}
    >
      {d.summaryFlag && (
        <div className="flex items-center gap-1.5 text-[10px] text-rose-300/80">
          <CheckCircle2 size={10} />
          Summary report enabled
        </div>
      )}
    </BaseNode>
  );
}
