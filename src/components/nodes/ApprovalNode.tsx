import type { Node, NodeProps } from '@xyflow/react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { ApprovalNodeData } from '../../types/workflow';

type ApprovalFlowNode = Node<ApprovalNodeData, 'approvalNode'>;

export function ApprovalNode({ id, selected, data }: NodeProps<ApprovalFlowNode>) {
  const d = data;
  return (
    <BaseNode
      id={id}
      selected={!!selected}
      hasError={d.hasError}
      errorMessage={d.errorMessage}
      accentColor="bg-amber-500"
      icon={<CheckCircle2 size={12} />}
      label="Approval"
      subtitle={d.title || 'Requires approval'}
      dark={true}
    >
      <div className="space-y-1">
        {d.approverRole && (
          <div className="flex items-center gap-1 text-[10px] text-white/50">
            <ShieldCheck size={9} /> <span>{d.approverRole}</span>
          </div>
        )}
        {d.autoApproveThreshold > 0 && (
          <p className="text-[10px] text-white/40">
            Auto-approve &gt; {d.autoApproveThreshold}
          </p>
        )}
      </div>
    </BaseNode>
  );
}
