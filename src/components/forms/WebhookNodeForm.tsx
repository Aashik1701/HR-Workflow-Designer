import { useState } from 'react';
import { Plus, Trash2, Copy, Check, RefreshCw } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import type { WebhookNodeData } from '../../types/workflow';

interface Props { nodeId: string; data: WebhookNodeData; }

function generateWebhookUrl() {
  return '/api/webhook/' + Math.random().toString(36).substring(2, 10);
}

export function WebhookNodeForm({ nodeId, data }: Props) {
  const { updateNodeData } = useWorkflowStore();
  const [copied, setCopied] = useState(false);

  const inputClass = "w-full text-xs border border-white/10 bg-[#12121a] text-white placeholder-white/30 rounded px-2 py-1.5 focus:ring-1 ring-indigo-500 outline-none";
  const labelClass = "block text-xs font-medium text-white/70 mb-1";

  const upd = (patch: Partial<WebhookNodeData>) =>
    updateNodeData(nodeId, { ...data, ...patch });

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.origin + data.webhookUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Payload schema helpers
  const addField = () =>
    upd({ payloadSchema: [...(data.payloadSchema ?? []), { key: '', value: 'string' }] });
  const removeField = (i: number) =>
    upd({ payloadSchema: data.payloadSchema.filter((_, idx) => idx !== i) });
  const updateField = (i: number, field: 'key' | 'value', v: string) => {
    const updated = [...data.payloadSchema];
    updated[i] = { ...updated[i], [field]: v };
    upd({ payloadSchema: updated });
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className={labelClass}>Node Title</label>
        <input
          className={inputClass}
          value={data.title}
          onChange={e => upd({ title: e.target.value })}
          placeholder="e.g., ATS Candidate Trigger"
        />
      </div>

      {/* Generated URL */}
      <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-orange-300">Webhook Endpoint URL</label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => upd({ webhookUrl: generateWebhookUrl() })}
              className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/70 transition-colors"
              title="Regenerate URL"
            >
              <RefreshCw size={10} /> Regenerate
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 text-[10px] text-orange-300/70 hover:text-orange-300 transition-colors"
            >
              {copied ? <Check size={10} /> : <Copy size={10} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        <code className="block text-[10px] font-mono text-white/60 bg-black/30 rounded px-2 py-1.5 break-all">
          {window.location.origin}{data.webhookUrl}
        </code>
      </div>

      {/* HTTP Method */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>HTTP Method</label>
          <select
            className={inputClass}
            value={data.httpMethod}
            onChange={e => upd({ httpMethod: e.target.value as WebhookNodeData['httpMethod'] })}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Authentication</label>
          <select
            className={inputClass}
            value={data.authType}
            onChange={e => upd({ authType: e.target.value as WebhookNodeData['authType'] })}
          >
            <option value="none">None</option>
            <option value="bearer">Bearer Token</option>
            <option value="apiKey">API Key</option>
          </select>
        </div>
      </div>

      {/* Auth token (conditional) */}
      {data.authType !== 'none' && (
        <div>
          <label className={labelClass}>
            {data.authType === 'bearer' ? 'Bearer Token' : 'API Key'}
          </label>
          <input
            className={inputClass}
            type="password"
            value={data.authToken}
            onChange={e => upd({ authToken: e.target.value })}
            placeholder={data.authType === 'bearer' ? 'eyJhbGci...' : 'sk-...'}
          />
        </div>
      )}

      {/* Payload Schema */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-white/70">
            Incoming JSON Schema
          </label>
          <button
            type="button"
            onClick={addField}
            className="flex items-center gap-1 text-[10px] text-orange-300/80 hover:text-orange-300"
          >
            <Plus size={10} /> Add Field
          </button>
        </div>
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2 space-y-1.5">
          {(data.payloadSchema ?? []).length === 0 && (
            <p className="text-[10px] text-white/30 text-center py-2">
              No fields defined. Add a field to define the incoming payload shape.
            </p>
          )}
          {(data.payloadSchema ?? []).map((pair, i) => (
            <div key={i} className="flex gap-1.5 items-center">
              <input
                className="flex-1 text-xs border border-white/10 bg-[#12121a] text-white placeholder-white/30 rounded px-2 py-1 focus:ring-1 ring-indigo-500 outline-none font-mono"
                placeholder="field_name"
                value={pair.key}
                onChange={e => updateField(i, 'key', e.target.value)}
              />
              <select
                className="text-xs border border-white/10 bg-[#12121a] text-white/70 rounded px-1.5 py-1 focus:ring-1 ring-indigo-500 outline-none"
                value={pair.value}
                onChange={e => updateField(i, 'value', e.target.value)}
              >
                <option value="string">string</option>
                <option value="number">number</option>
                <option value="boolean">boolean</option>
                <option value="object">object</option>
                <option value="array">array</option>
              </select>
              <button type="button" onClick={() => removeField(i)} className="text-white/30 hover:text-red-400 transition-colors">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-white/30">
          Fields become available as <code className="text-orange-300/70 font-mono">{`{{ field_name }}`}</code> variables downstream.
        </p>
      </div>
    </div>
  );
}
