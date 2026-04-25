import type { Node, NodeProps } from '@xyflow/react';
import { Repeat, Hash } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { LoopNodeData } from '../../types/workflow';

type LoopFlowNode = Node<LoopNodeData, 'loopNode'>;

export function LoopNode({ id, selected, data }: NodeProps<LoopFlowNode>) {
  const d = data;

  return (
    <BaseNode
      id={id}
      selected={!!selected}
      hasError={d.hasError}
      errorMessage={d.errorMessage}
      accentGradient="from-yellow-400 to-orange-500"
      accentText="text-yellow-300"
      accentPill="bg-yellow-500/15 border border-yellow-500/20"
      bgGradient="bg-gradient-to-br from-yellow-500/10 to-[#181828]"
      borderGlow="border border-yellow-500/20"
      icon={<Repeat size={13} />}
      label={d.title || 'Loop Iterator'}
      typeLabel="Loop"
      subtitle="Iterate over a list"
    >
      <div className="space-y-2">
        {/* Source + max iterations */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-yellow-300/80 bg-yellow-500/10 border border-yellow-500/15 px-2 py-0.5 rounded-lg">
            <Repeat size={9} />
            {d.iteratorSource || 'source'}
          </span>
          <span className="inline-flex items-center gap-1 text-[9px] text-white/40">
            <Hash size={9} />
            max {d.maxIterations}
          </span>
        </div>

        {/* Current item variable */}
        <div className="rounded-lg bg-black/20 border border-white/5 px-2.5 py-1.5 flex items-center justify-between">
          <span className="text-[9px] text-white/40">Current item →</span>
          <code className="text-[10px] font-mono text-orange-300/80">{`{{ ${d.currentItemVariable || 'item'} }}`}</code>
        </div>
      </div>
    </BaseNode>
  );
}
