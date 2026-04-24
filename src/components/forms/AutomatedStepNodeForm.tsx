import { useWorkflowStore } from '../../store/workflowStore';
import { useAutomations } from '../../hooks/useAutomations';
import type { AutomatedStepNodeData } from '../../types/workflow';

interface Props { nodeId: string; data: AutomatedStepNodeData; }

export function AutomatedStepNodeForm({ nodeId, data }: Props) {
  const { updateNodeData } = useWorkflowStore();
  const { automations, loading } = useAutomations();

  // When action changes, reset params
  const handleActionChange = (actionId: string) => {
    updateNodeData(nodeId, { ...data, actionId, actionParams: {} });
  };

  const handleParamChange = (param: string, value: string) => {
    updateNodeData(nodeId, {
      ...data,
      actionParams: { ...data.actionParams, [param]: value },
    });
  };

  const selectedAction = automations.find(a => a.id === data.actionId);
  const inputClass = "w-full text-xs border border-slate-200 rounded px-2 py-1.5 focus:ring-1 ring-indigo-400 outline-none";
  const labelClass = "block text-xs font-medium text-slate-600 mb-1";

  return (
    <div className="space-y-3">
      <div>
        <label className={labelClass}>Step Title</label>
        <input
          className={inputClass}
          value={data.title}
          onChange={e => updateNodeData(nodeId, { ...data, title: e.target.value })}
          placeholder="e.g., Send Welcome Email"
        />
      </div>
      <div>
        <label className={labelClass}>Action</label>
        {loading ? (
          <div className="text-xs text-slate-400 animate-pulse">Loading actions...</div>
        ) : (
          <select
            className={inputClass}
            value={data.actionId ?? ''}
            onChange={e => handleActionChange(e.target.value)}
          >
            <option value="">-- Select an action --</option>
            {automations.map(a => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
        )}
      </div>

      {/* Dynamic params — renders based on selected action */}
      {selectedAction && selectedAction.params.length > 0 && (
        <div className="space-y-2">
          <label className={labelClass}>Action Parameters</label>
          {selectedAction.params.map(param => (
            <div key={param}>
              <label className="text-[10px] text-slate-500 capitalize mb-0.5 block">{param}</label>
              <input
                className={inputClass}
                value={data.actionParams?.[param] ?? ''}
                onChange={e => handleParamChange(param, e.target.value)}
                placeholder={`Enter ${param}...`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
