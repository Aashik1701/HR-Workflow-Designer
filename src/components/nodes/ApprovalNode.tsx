import type { Node, NodeProps } from '@xyflow/react';
import { ShieldCheck } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { ApprovalNodeData } from '../../types/workflow';

type ApprovalFlowNode = Node<ApprovalNodeData, 'approvalNode'>;

const roleColor: Record<string, string> = {
  Manager: 'text-amber-300 bg-amber-500/15 border-amber-500/20',
  HRBP:    'text-orange-300 bg-orange-500/15 border-orange-500/20',
  Director:'text-rose-300 bg-rose-500/15 border-rose-500/20',
};

export function ApprovalNode({ id, selected, data }: NodeProps<ApprovalFlowNode>) {
  const d = data;
  const tone = roleColor[d.approverRole] ?? roleColor.Manager;
  return (
    <BaseNode
      id={id}
      selected={!!selected}
      hasError={d.hasError}
      errorMessage={d.errorMessage}
      accentGradient="from-amber-400 to-orange-500"
      accentText="text-amber-300"
      accentPill="bg-amber-500/15 border border-amber-500/20"
      bgGradient="bg-gradient-to-br from-amber-500/10 to-[#181828]"
      borderGlow="border border-amber-500/20"
      icon={<ShieldCheck size={13} />}
      label={d.title || 'Approval Gate'}
      typeLabel="Approval"
      subtitle="Requires sign-off"
    >
      <div className="flex items-center justify-between gap-2">
        <div className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg border ${tone}`}>
          <ShieldCheck size={9} />
          {d.approverRole}
        </div>
        {d.autoApproveThreshold > 0 && (
          <span className="text-[10px] text-white/35">auto &gt; {d.autoApproveThreshold}</span>
        )}
      </div>
    </BaseNode>
  );
}
