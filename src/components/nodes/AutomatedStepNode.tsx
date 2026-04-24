import type { NodeProps } from '@xyflow/react';
import { Zap } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { AutomatedStepNodeData } from '../../types/workflow';

export function AutomatedStepNode({ id, selected, data }: NodeProps) {
  const d = data as unknown as AutomatedStepNodeData;
  return (
    <BaseNode
      id={id}
      selected={!!selected}
      hasError={d.hasError}
      errorMessage={d.errorMessage}
      accentColor="bg-purple-500"
      icon={<Zap size={12} />}
      label="Automated Step"
      subtitle={d.title || 'System action'}
    >
      {d.actionId && (
        <p className="text-[10px] text-slate-500 font-mono bg-slate-50 px-1.5 py-0.5 rounded">
          {d.actionId}
        </p>
      )}
    </BaseNode>
  );
}
