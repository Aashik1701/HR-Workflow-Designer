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
      accentColor="bg-slate-600"
      icon={<Clock size={12} />}
      label="Wait"
      subtitle={d.title || 'Delay Execution'}
      dark={true}
    >
      <div className="flex items-center justify-center gap-1 text-xs font-semibold text-white/80 bg-white/5 py-1.5 rounded border border-white/10">
        <span>{d.duration}</span>
        <span className="text-white/50 capitalize">{d.unit}</span>
      </div>
    </BaseNode>
  );
}
