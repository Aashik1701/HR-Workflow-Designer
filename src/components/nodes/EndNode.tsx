import type { NodeProps } from '@xyflow/react';
import { Flag } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { EndNodeData } from '../../types/workflow';

export function EndNode({ id, selected, data }: NodeProps) {
  const d = data as unknown as EndNodeData;
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
