import type { NodeProps } from '@xyflow/react';
import { Play } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { StartNodeData } from '../../types/workflow';

export function StartNode({ id, selected, data }: NodeProps) {
  const d = data as unknown as StartNodeData;
  return (
    <BaseNode
      id={id}
      selected={!!selected}
      hasError={d.hasError}
      errorMessage={d.errorMessage}
      accentColor="bg-emerald-500"
      icon={<Play size={12} />}
      label="Start"
      subtitle={d.title || 'Workflow entry point'}
      showTargetHandle={false}
    >
      {d.metadata?.length > 0 && (
        <p className="text-[10px] text-slate-400">
          {d.metadata.length} metadata key(s)
        </p>
      )}
    </BaseNode>
  );
}
