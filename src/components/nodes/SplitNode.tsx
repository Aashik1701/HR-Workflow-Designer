import type { Node, NodeProps } from '@xyflow/react';
import { GitBranch } from 'lucide-react';
import { Handle, Position } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import type { SplitNodeData } from '../../types/workflow';

type SplitFlowNode = Node<SplitNodeData, 'splitNode'>;

export function SplitNode({ id, selected, data }: NodeProps<SplitFlowNode>) {
  const d = data;
  return (
    <div className="relative">
      <BaseNode
        id={id}
        selected={!!selected}
        hasError={d.hasError}
        errorMessage={d.errorMessage}
        accentColor="bg-cyan-500"
        icon={<GitBranch size={12} />}
        label="Split Flow"
        subtitle={d.title || 'A/B Route'}
        showSourceHandle={false} // We provide custom handles
        dark={true}
      >
        <div className="text-[10px] text-white/50 bg-black/20 rounded p-1.5 flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="font-mono text-cyan-400">A</span>
            <span className="truncate max-w-[80px]">{d.pathALabel}</span>
            <span className="font-semibold">{d.splitPercentage}%</span>
          </div>
          <div className="w-full h-px bg-white/10" />
          <div className="flex justify-between items-center">
            <span className="font-mono text-fuchsia-400">B</span>
            <span className="truncate max-w-[80px]">{d.pathBLabel}</span>
            <span className="font-semibold">{100 - d.splitPercentage}%</span>
          </div>
        </div>
      </BaseNode>

      {/* Custom Source Handles */}
      <Handle
        type="source"
        id="pathA"
        position={Position.Bottom}
        style={{ left: '25%' }}
        className="!w-3 !h-3 !border-2 !bg-white/20 !border-[#1a1a2e] hover:!bg-cyan-400"
      />
      <Handle
        type="source"
        id="pathB"
        position={Position.Bottom}
        style={{ left: '75%' }}
        className="!w-3 !h-3 !border-2 !bg-white/20 !border-[#1a1a2e] hover:!bg-fuchsia-400"
      />
    </div>
  );
}
