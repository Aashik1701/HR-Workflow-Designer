import type { Node, NodeProps } from '@xyflow/react';
import { Clock } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { DelayNodeData } from '../../types/workflow';

type DelayFlowNode = Node<DelayNodeData, 'delayNode'>;

export function DelayNode({ id, selected, data }: NodeProps<DelayFlowNode>) {
  const d = data;
  return (
    <BaseNode
      id={id}
      selected={!!selected}
      hasError={d.hasError}
      errorMessage={d.errorMessage}
      accentGradient="from-slate-400 to-slate-600"
      accentText="text-slate-300"
      accentPill="bg-slate-500/15 border border-slate-500/20"
      bgGradient="bg-gradient-to-br from-slate-500/10 to-[#181828]"
      borderGlow="border border-slate-500/20"
      icon={<Clock size={13} />}
      label={d.title || 'Wait'}
      typeLabel="Delay"
      subtitle="Pause execution"
    >
      <div className="flex items-center justify-center gap-2 py-1 rounded-xl bg-white/[0.04] border border-white/[0.07]">
        <span className="text-xl font-black text-white/90 tabular-nums leading-none">{d.duration}</span>
        <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">{d.unit}</span>
      </div>
    </BaseNode>
  );
}
