import { useWorkflowStore } from '../../store/workflowStore';
import { KeyValueEditor } from '../ui/KeyValueEditor';
import type { StartNodeData } from '../../types/workflow';

interface Props { nodeId: string; data: StartNodeData; }

export function StartNodeForm({ nodeId, data }: Props) {
  const { updateNodeData } = useWorkflowStore();
  const triggerType = data.triggerType ?? 'manual';
  const triggerConfig = data.triggerConfig ?? {};

  const inputClass = "w-full text-xs border border-white/10 bg-[#12121a] text-white placeholder-white/30 rounded px-2 py-1.5 focus:ring-1 ring-indigo-500 outline-none";
  const labelClass = "block text-xs font-medium text-white/70 mb-1";

  const updateTriggerType = (nextType: NonNullable<StartNodeData['triggerType']>) => {
    updateNodeData(nodeId, {
      ...data,
      triggerType: nextType,
      triggerConfig: {},
    });
  };

  const updateTriggerConfig = (patch: Partial<NonNullable<StartNodeData['triggerConfig']>>) => {
    updateNodeData(nodeId, {
      ...data,
      triggerType,
      triggerConfig: {
        ...triggerConfig,
        ...patch,
      },
    });
  };

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

      <div className="space-y-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div>
          <label className={labelClass}>Trigger Type</label>
          <select
            className={inputClass}
            value={triggerType}
            onChange={e => updateTriggerType(e.target.value as NonNullable<StartNodeData['triggerType']>)}
          >
            <option value="manual">Manual</option>
            <option value="schedule">Schedule (Cron)</option>
            <option value="webhook">Webhook</option>
            <option value="event">Event-based</option>
          </select>
        </div>

        {triggerType === 'schedule' && (
          <div>
            <label className={labelClass}>Cron Expression</label>
            <input
              className={inputClass}
              value={triggerConfig.cron ?? ''}
              onChange={e => updateTriggerConfig({ cron: e.target.value })}
              placeholder="e.g., 0 9 * * 1-5"
            />
          </div>
        )}

        {triggerType === 'webhook' && (
          <div>
            <label className={labelClass}>Webhook Path</label>
            <input
              className={inputClass}
              value={triggerConfig.webhookPath ?? ''}
              onChange={e => updateTriggerConfig({ webhookPath: e.target.value })}
              placeholder="e.g., /triggers/new-hire"
            />
          </div>
        )}

        {triggerType === 'event' && (
          <>
            <div>
              <label className={labelClass}>Event Name</label>
              <input
                className={inputClass}
                value={triggerConfig.eventName ?? ''}
                onChange={e => updateTriggerConfig({ eventName: e.target.value })}
                placeholder="e.g., employee.created"
              />
            </div>
            <div>
              <label className={labelClass}>Event Source</label>
              <input
                className={inputClass}
                value={triggerConfig.source ?? ''}
                onChange={e => updateTriggerConfig({ source: e.target.value })}
                placeholder="e.g., hris-system"
              />
            </div>
          </>
        )}
      </div>

      <div>
        <div className="mb-2">
          <span className="text-xs font-medium text-white/70">Initial Payload Variables</span>
          <p className="text-[10px] text-white/40 mt-0.5 leading-tight">
            Define key-value pairs here to pass data into the pipeline. You can reference these downstream using <span className="font-mono text-teal-400 bg-teal-500/10 px-1 rounded">{'{{ key }}'}</span> syntax.
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
