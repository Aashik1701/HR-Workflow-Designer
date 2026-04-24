import type { Node, NodeProps } from '@xyflow/react';
import { Flag } from 'lucide-react';
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
      accentColor="bg-rose-500"
      icon={<Flag size={12} />}
      label="End"
      subtitle={d.endMessage || 'Workflow complete'}
      showSourceHandle={false}
    >
      {d.summaryFlag && (
        <span className="text-[10px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-full">
          Summary enabled
        </span>
      )}
    </BaseNode>
  );
}
