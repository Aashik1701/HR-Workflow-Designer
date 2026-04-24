import type { NodeProps } from '@xyflow/react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { ApprovalNodeData } from '../../types/workflow';

export function ApprovalNode({ id, selected, data }: NodeProps) {
  const d = data as unknown as ApprovalNodeData;
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
    >
      <div className="space-y-1">
        {d.approverRole && (
          <div className="flex items-center gap-1 text-[10px] text-slate-500">
            <ShieldCheck size={9} /> <span>{d.approverRole}</span>
          </div>
        )}
        {d.autoApproveThreshold > 0 && (
          <p className="text-[10px] text-slate-400">
            Auto-approve &gt; {d.autoApproveThreshold}
          </p>
        )}
      </div>
    </BaseNode>
  );
}
