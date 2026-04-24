import { useWorkflowStore } from '../../store/workflowStore';
import type { DelayNodeData } from '../../types/workflow';

interface Props { nodeId: string; data: DelayNodeData; }

export function DelayNodeForm({ nodeId, data }: Props) {
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
          placeholder="e.g., Wait for signature"
        />
      </div>
      
      <div className="flex gap-2">
        <div className="flex-1">
          <label className={labelClass}>Duration</label>
          <input
            type="number"
            min="1"
            className={inputClass}
            value={data.duration}
            onChange={e => updateNodeData(nodeId, { ...data, duration: parseInt(e.target.value, 10) || 1 })}
          />
        </div>
        <div className="flex-1">
          <label className={labelClass}>Unit</label>
          <select
            className={inputClass}
            value={data.unit}
            onChange={e => updateNodeData(nodeId, { ...data, unit: e.target.value as DelayNodeData['unit'] })}
          >
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
            <option value="days">Days</option>
          </select>
        </div>
      </div>
    </div>
  );
}
