import { useWorkflowStore } from '../../store/workflowStore';
import { KeyValueEditor } from '../ui/KeyValueEditor';
import type { StartNodeData } from '../../types/workflow';

interface Props { nodeId: string; data: StartNodeData; }

export function StartNodeForm({ nodeId, data }: Props) {
  const { updateNodeData } = useWorkflowStore();

  const inputClass = "w-full text-xs border border-white/10 bg-[#12121a] text-white placeholder-white/30 rounded px-2 py-1.5 focus:ring-1 ring-indigo-500 outline-none";
  const labelClass = "block text-xs font-medium text-white/70 mb-1";

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
      <div>
        <div className="mb-2">
          <span className="text-xs font-medium text-white/70">Initial Payload Variables</span>
          <p className="text-[10px] text-white/40 mt-0.5 leading-tight">
            Define key-value pairs here to pass data into the pipeline. You can reference these downstream using <span className="font-mono text-fuchsia-400 bg-fuchsia-500/10 px-1 rounded">{'{{ key }}'}</span> syntax.
          </p>
        </div>
        <KeyValueEditor
          value={data.metadata ?? []}
          onChange={pairs => updateNodeData(nodeId, { ...data, metadata: pairs })}
        />
      </div>
    </div>
  );
}
