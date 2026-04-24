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
      accentColor="bg-emerald-500"
      icon={<Play size={12} />}
      label="Start"
      subtitle={d.title || 'Workflow entry point'}
      showTargetHandle={false}
      dark={true}
    >
      {d.metadata?.length > 0 && (
        <p className="text-[10px] text-white/40">
          {d.metadata.length} metadata key(s)
        </p>
      )}
    </BaseNode>
  );
}
