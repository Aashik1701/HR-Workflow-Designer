import type { Node, NodeProps } from '@xyflow/react';
import { GitBranch } from 'lucide-react';
import { Handle, Position } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import type { SplitNodeData } from '../../types/workflow';

type SplitFlowNode = Node<SplitNodeData, 'splitNode'>;

export function SplitNode({ id, selected, data }: NodeProps<SplitFlowNode>) {
  const d = data;
  const pctA = d.splitPercentage ?? 50;
  const pctB = 100 - pctA;

  return (
    <div className="relative">
      <BaseNode
        id={id}
        selected={!!selected}
        hasError={d.hasError}
        errorMessage={d.errorMessage}
        accentGradient="from-cyan-400 to-teal-500"
        accentText="text-cyan-300"
        accentPill="bg-cyan-500/15 border border-cyan-500/20"
        bgGradient="bg-gradient-to-br from-cyan-500/10 to-[#181828]"
        borderGlow="border border-cyan-500/20"
        icon={<GitBranch size={13} />}
        label={d.title || 'Split Flow'}
        typeLabel="A/B Split"
        subtitle="Traffic routing"
        showSourceHandle={false}
      >
        {/* Path rows */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black text-cyan-300 uppercase tracking-widest w-4">A</span>
              <span className="text-[10px] text-white/65 truncate max-w-[80px]">{d.pathALabel || 'Path A'}</span>
            </div>
            <span className="text-[11px] font-bold text-cyan-300 tabular-nums">{pctA}%</span>
          </div>
          <div className="flex items-center justify-between gap-2 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 px-2.5 py-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black text-fuchsia-300 uppercase tracking-widest w-4">B</span>
              <span className="text-[10px] text-white/65 truncate max-w-[80px]">{d.pathBLabel || 'Path B'}</span>
            </div>
            <span className="text-[11px] font-bold text-fuchsia-300 tabular-nums">{pctB}%</span>
          </div>
        </div>
      </BaseNode>

      {/* Custom source handles */}
      <Handle
        type="source"
        id="pathA"
        position={Position.Bottom}
        style={{ left: '28%' }}
        className="!w-2.5 !h-2.5 !border-2 !border-[#181828] !bg-cyan-400/70 hover:!bg-cyan-400 transition-colors"
        title="Path A"
      />
      <Handle
        type="source"
        id="pathB"
        position={Position.Bottom}
        style={{ left: '72%' }}
        className="!w-2.5 !h-2.5 !border-2 !border-[#181828] !bg-fuchsia-400/70 hover:!bg-fuchsia-400 transition-colors"
        title="Path B"
      />
    </div>
  );
}
