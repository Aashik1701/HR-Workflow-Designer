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
          placeholder="e.g., Send Welcome Email"
        />
      </div>
      <div>
        <label className={labelClass}>Action</label>
        {loading ? (
          <div className="text-xs text-white/40 animate-pulse">Loading actions...</div>
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
        <div className="space-y-2 mt-2 pt-2 border-t border-white/5">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-medium text-white/70">Action Parameters</label>
            <span className="text-[9px] text-fuchsia-400/80 font-mono bg-fuchsia-500/10 px-1.5 py-0.5 rounded" title="You can inject variables from the Start payload using {{ key }} syntax">Supports {'{{ var }}'}</span>
          </div>
          {selectedAction.params.map(param => (
            <div key={param}>
              <label className="text-[10px] text-white/50 capitalize mb-0.5 block">{param}</label>
              <input
                className={inputClass}
                value={data.actionParams?.[param] ?? ''}
                onChange={e => handleParamChange(param, e.target.value)}
                placeholder={`e.g. {{ employee.${param} }}`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
