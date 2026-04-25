import { useWorkflowStore } from '../../store/workflowStore';
import { useAutomations } from '../../hooks/useAutomations';
import type { AutomatedStepNodeData } from '../../types/workflow';

interface Props { nodeId: string; data: AutomatedStepNodeData; }

export function AutomatedStepNodeForm({ nodeId, data }: Props) {
  const { updateNodeData, nodes } = useWorkflowStore();
  const { automations, loading } = useAutomations();

  const reliability: NonNullable<AutomatedStepNodeData['reliability']> = {
    retryPolicy: {
      maxRetries: data.reliability?.retryPolicy?.maxRetries ?? 1,
      backoffMs: data.reliability?.retryPolicy?.backoffMs ?? 500,
      strategy: data.reliability?.retryPolicy?.strategy ?? 'fixed',
    },
    timeoutMs: data.reliability?.timeoutMs ?? 5000,
    deadLetterQueue: {
      enabled: data.reliability?.deadLetterQueue?.enabled ?? false,
      queueName: data.reliability?.deadLetterQueue?.queueName ?? 'automation_dead_letter',
    },
    onFailure: {
      mode: data.reliability?.onFailure?.mode ?? 'continue',
      branchTargetNodeId: data.reliability?.onFailure?.branchTargetNodeId,
    },
  };

  const updateReliability = (next: AutomatedStepNodeData['reliability']) => {
    updateNodeData(nodeId, { ...data, reliability: next });
  };

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
  const branchTargets = nodes
    .filter(n => n.id !== nodeId)
    .map(n => ({
      id: n.id,
      label:
        typeof n.data.title === 'string' && n.data.title.trim().length > 0
          ? n.data.title
          : n.id,
    }));
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
            <span className="text-[9px] text-teal-400/80 font-mono bg-teal-500/10 px-1.5 py-0.5 rounded" title="You can inject variables from the Start payload using {{ key }} syntax">Supports {'{{ var }}'}</span>
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

      <div className="space-y-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="text-xs font-medium text-white/75">Execution Reliability</div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelClass}>Max Retries</label>
            <input
              type="number"
              min={0}
              max={10}
              className={inputClass}
              value={reliability.retryPolicy.maxRetries}
              onChange={e =>
                updateReliability({
                  ...reliability,
                  retryPolicy: {
                    ...reliability.retryPolicy,
                    maxRetries: Math.max(0, Number(e.target.value || 0)),
                  },
                })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Timeout (ms)</label>
            <input
              type="number"
              min={100}
              className={inputClass}
              value={reliability.timeoutMs}
              onChange={e =>
                updateReliability({
                  ...reliability,
                  timeoutMs: Math.max(100, Number(e.target.value || 100)),
                })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelClass}>Backoff (ms)</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={reliability.retryPolicy.backoffMs}
              onChange={e =>
                updateReliability({
                  ...reliability,
                  retryPolicy: {
                    ...reliability.retryPolicy,
                    backoffMs: Math.max(0, Number(e.target.value || 0)),
                  },
                })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Backoff Strategy</label>
            <select
              className={inputClass}
              value={reliability.retryPolicy.strategy}
              onChange={e =>
                updateReliability({
                  ...reliability,
                  retryPolicy: {
                    ...reliability.retryPolicy,
                    strategy: e.target.value as 'fixed' | 'exponential',
                  },
                })
              }
            >
              <option value="fixed">Fixed</option>
              <option value="exponential">Exponential</option>
            </select>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-white/10">
          <label className="inline-flex items-center gap-2 text-xs text-white/70">
            <input
              type="checkbox"
              checked={reliability.deadLetterQueue.enabled}
              onChange={e =>
                updateReliability({
                  ...reliability,
                  deadLetterQueue: {
                    ...reliability.deadLetterQueue,
                    enabled: e.target.checked,
                  },
                })
              }
            />
            Send failed runs to Dead-letter Queue
          </label>
          {reliability.deadLetterQueue.enabled && (
            <div>
              <label className={labelClass}>DLQ Name</label>
              <input
                className={inputClass}
                value={reliability.deadLetterQueue.queueName}
                onChange={e =>
                  updateReliability({
                    ...reliability,
                    deadLetterQueue: {
                      ...reliability.deadLetterQueue,
                      queueName: e.target.value,
                    },
                  })
                }
                placeholder="automation_dead_letter"
              />
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-white/10">
          <label className={labelClass}>On Failure</label>
          <select
            className={inputClass}
            value={reliability.onFailure.mode}
            onChange={e =>
              updateReliability({
                ...reliability,
                onFailure: {
                  mode: e.target.value as 'continue' | 'branch' | 'deadLetterQueue',
                  branchTargetNodeId: reliability.onFailure.branchTargetNodeId,
                },
              })
            }
          >
            <option value="continue">Continue pipeline</option>
            <option value="branch">Route to failure branch</option>
            <option value="deadLetterQueue">Dead-letter queue</option>
          </select>

          {reliability.onFailure.mode === 'branch' && (
            <div className="mt-2">
              <label className={labelClass}>Failure Branch Target</label>
              <select
                className={inputClass}
                value={reliability.onFailure.branchTargetNodeId ?? ''}
                onChange={e =>
                  updateReliability({
                    ...reliability,
                    onFailure: {
                      ...reliability.onFailure,
                      branchTargetNodeId: e.target.value || undefined,
                    },
                  })
                }
              >
                <option value="">-- Select target node --</option>
                {branchTargets.map(target => (
                  <option key={target.id} value={target.id}>{target.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
