import type { Node, NodeProps } from '@xyflow/react';
import { GitFork, Merge } from 'lucide-react';
import { Handle, Position } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import type { ForkNodeData } from '../../types/workflow';

type ForkFlowNode = Node<ForkNodeData, 'forkNode'>;

export function ForkNode({ id, selected, data }: NodeProps<ForkFlowNode>) {
  const d = data;
  const isFork = d.mode === 'fork';
  const branchCount = d.branches ?? 2;
  const labels = d.branchLabels ?? [];

  return (
    <div className="relative">
      <BaseNode
        id={id}
        selected={!!selected}
        hasError={d.hasError}
        errorMessage={d.errorMessage}
        accentGradient={isFork ? "from-pink-400 to-rose-500" : "from-emerald-400 to-teal-500"}
        accentText={isFork ? "text-pink-300" : "text-emerald-300"}
        accentPill={isFork ? "bg-pink-500/15 border border-pink-500/20" : "bg-emerald-500/15 border border-emerald-500/20"}
        bgGradient={isFork ? "bg-gradient-to-br from-pink-500/10 to-[#181828]" : "bg-gradient-to-br from-emerald-500/10 to-[#181828]"}
        borderGlow={isFork ? "border border-pink-500/20" : "border border-emerald-500/20"}
        icon={isFork ? <GitFork size={13} /> : <Merge size={13} />}
        label={d.title || (isFork ? 'Parallel Fork' : 'Join / Wait All')}
        typeLabel={isFork ? "Fork" : "Join"}
        subtitle={isFork ? 'Run in parallel' : 'Wait for all branches'}
        showSourceHandle={!isFork}
        showTargetHandle={true}
      >
        <div className="space-y-1.5">
          {isFork && Array.from({ length: branchCount }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg bg-pink-500/10 border border-pink-500/15 px-2.5 py-1">
              <span className="text-[9px] font-black text-pink-300 uppercase tracking-widest w-3">{i + 1}</span>
              <span className="text-[10px] text-white/60 truncate">{labels[i] || `Branch ${i + 1}`}</span>
            </div>
          ))}
          {!isFork && (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-1.5">
              <Merge size={11} className="text-emerald-300" />
              <span className="text-[10px] text-emerald-300/80 font-medium">Awaiting all {branchCount} branches</span>
            </div>
          )}
        </div>
      </BaseNode>

      {/* Fork mode: custom source handles for each branch */}
      {isFork && Array.from({ length: branchCount }).map((_, i) => {
        const pct = ((i + 1) / (branchCount + 1)) * 100;
        return (
          <Handle
            key={`branch-${i}`}
            type="source"
            id={`branch-${i}`}
            position={Position.Bottom}
            style={{ left: `${pct}%` }}
            className="!w-2.5 !h-2.5 !border-2 !border-[#181828] !bg-pink-400/70 hover:!bg-pink-400 transition-colors"
            title={labels[i] || `Branch ${i + 1}`}
          />
        );
      })}
    </div>
  );
}
