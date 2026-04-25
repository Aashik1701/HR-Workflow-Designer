import { useWorkflowStore } from '../../store/workflowStore';
import type { SplitNodeData } from '../../types/workflow';

interface Props { nodeId: string; data: SplitNodeData; }

export function SplitNodeForm({ nodeId, data }: Props) {
  const { updateNodeData } = useWorkflowStore();

  const inputClass = "w-full text-xs border border-white/10 bg-[#12121a] text-white placeholder-white/30 rounded px-2 py-1.5 focus:ring-1 ring-indigo-500 outline-none";
  const labelClass = "block text-xs font-medium text-white/70 mb-1";

  return (
    <div className="space-y-3">
      <div>
        <label className={labelClass}>Step Title</label>
        <input
          className={inputClass}
          value={data.title}
          onChange={e => updateNodeData(nodeId, { ...data, title: e.target.value })}
          placeholder="e.g., A/B Test"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
        <div>
          <label className="text-[10px] text-cyan-400 font-medium mb-1 block">Path A Label</label>
          <input
            className={inputClass}
            value={data.pathALabel}
            onChange={e => updateNodeData(nodeId, { ...data, pathALabel: e.target.value })}
          />
        </div>
        <div>
          <label className="text-[10px] text-teal-400 font-medium mb-1 block">Path B Label</label>
          <input
            className={inputClass}
            value={data.pathBLabel}
            onChange={e => updateNodeData(nodeId, { ...data, pathBLabel: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Traffic Split ({data.splitPercentage}% / {100 - data.splitPercentage}%)</label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={data.splitPercentage}
            onChange={e => updateNodeData(nodeId, { ...data, splitPercentage: parseInt(e.target.value, 10) })}
            className="flex-1 accent-blue-500"
          />
        </div>
        <div className="flex justify-between text-[10px] text-white/40 mt-1">
          <span>Path A</span>
          <span>Path B</span>
        </div>
      </div>
    </div>
  );
}
