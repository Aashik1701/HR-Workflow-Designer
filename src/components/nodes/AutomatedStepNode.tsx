import type { Node, NodeProps } from '@xyflow/react';
import { Zap } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { AutomatedStepNodeData } from '../../types/workflow';

type AutomatedStepFlowNode = Node<AutomatedStepNodeData, 'automatedStepNode'>;

export function AutomatedStepNode({ id, selected, data }: NodeProps<AutomatedStepFlowNode>) {
  const d = data;
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
      dark={true}
    >
      {d.actionId && (
        <p className="text-[10px] text-white/50 font-mono bg-white/10 px-1.5 py-0.5 rounded border border-white/5">
          {d.actionId}
        </p>
      )}
    </BaseNode>
  );
}
