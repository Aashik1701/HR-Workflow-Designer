import { useWorkflowStore } from '../../store/workflowStore';
import type { EndNodeData } from '../../types/workflow';

interface Props { nodeId: string; data: EndNodeData; }

export function EndNodeForm({ nodeId, data }: Props) {
  const { updateNodeData } = useWorkflowStore();

  const inputClass = "w-full text-xs border border-slate-200 rounded px-2 py-1.5 focus:ring-1 ring-indigo-400 outline-none";
  const labelClass = "block text-xs font-medium text-slate-600 mb-1";

  return (
    <div className="space-y-3">
      <div>
        <label className={labelClass}>End Message</label>
        <input
          className={inputClass}
          value={data.endMessage}
          onChange={e => updateNodeData(nodeId, { ...data, endMessage: e.target.value })}
          placeholder="e.g., Onboarding complete"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="summaryFlag"
          checked={data.summaryFlag}
          onChange={e => updateNodeData(nodeId, { ...data, summaryFlag: e.target.checked })}
          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-400"
        />
        <label htmlFor="summaryFlag" className="text-xs text-slate-600">
          Generate summary on completion
        </label>
      </div>
    </div>
  );
}
