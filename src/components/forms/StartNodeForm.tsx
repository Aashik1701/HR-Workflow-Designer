import { useWorkflowStore } from '../../store/workflowStore';
import { KeyValueEditor } from '../ui/KeyValueEditor';
import type { StartNodeData } from '../../types/workflow';

interface Props { nodeId: string; data: StartNodeData; }

export function StartNodeForm({ nodeId, data }: Props) {
  const { updateNodeData } = useWorkflowStore();

  const inputClass = "w-full text-xs border border-slate-200 rounded px-2 py-1.5 focus:ring-1 ring-indigo-400 outline-none";
  const labelClass = "block text-xs font-medium text-slate-600 mb-1";

  return (
    <div className="space-y-3">
      <div>
        <label className={labelClass}>Workflow Title</label>
        <input
          className={inputClass}
          value={data.title}
          onChange={e => updateNodeData(nodeId, { ...data, title: e.target.value })}
          placeholder="e.g., Employee Onboarding"
        />
      </div>
      <KeyValueEditor
        value={data.metadata ?? []}
        onChange={pairs => updateNodeData(nodeId, { ...data, metadata: pairs })}
        label="Metadata"
      />
    </div>
  );
}
