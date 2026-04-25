import { useState } from 'react';
import { Plus, Trash2, Sparkles, Thermometer } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import type { AIActionNodeData } from '../../types/workflow';

interface Props { nodeId: string; data: AIActionNodeData; }

const MODELS: Array<{ id: AIActionNodeData['model']; label: string; badge: string }> = [
  { id: 'gpt-4o',        label: 'GPT-4o',        badge: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' },
  { id: 'gpt-4o-mini',   label: 'GPT-4o Mini',   badge: 'bg-teal-500/15 border-teal-500/30 text-teal-300' },
  { id: 'claude-sonnet', label: 'Claude Sonnet',  badge: 'bg-amber-500/15 border-amber-500/30 text-amber-300' },
  { id: 'gemini-pro',    label: 'Gemini Pro',     badge: 'bg-blue-500/15 border-blue-500/30 text-blue-300' },
];

export function AIActionNodeForm({ nodeId, data }: Props) {
  const { updateNodeData } = useWorkflowStore();
  const [newVar, setNewVar] = useState('');

  const inputClass = "w-full text-xs border border-white/10 bg-[#12121a] text-white placeholder-white/30 rounded px-2 py-1.5 focus:ring-1 ring-violet-500 outline-none";
  const labelClass = "block text-xs font-medium text-white/70 mb-1";

  const upd = (patch: Partial<AIActionNodeData>) =>
    updateNodeData(nodeId, { ...data, ...patch });

  const addVar = () => {
    const v = newVar.trim();
    if (!v || data.inputVariables.includes(v)) return;
    upd({ inputVariables: [...data.inputVariables, v] });
    setNewVar('');
  };

  const removeVar = (v: string) =>
    upd({ inputVariables: data.inputVariables.filter(x => x !== v) });

  const selectedModel = MODELS.find(m => m.id === data.model) ?? MODELS[0];

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className={labelClass}>Node Title</label>
        <input
          className={inputClass}
          value={data.title}
          onChange={e => upd({ title: e.target.value })}
          placeholder="e.g., Summarize Interview Feedback"
        />
      </div>

      {/* Model selector */}
      <div>
        <label className={labelClass}>LLM Model</label>
        <div className="grid grid-cols-2 gap-2">
          {MODELS.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => upd({ model: m.id })}
              className={`flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-2 rounded-lg border transition-all ${
                data.model === m.id
                  ? `${m.badge} ring-1 ring-offset-1 ring-offset-[#12121a] ring-current`
                  : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
              }`}
            >
              <Sparkles size={9} />
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* System Prompt */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-white/70">System Prompt</label>
          <span className="text-[9px] text-violet-400/80 font-mono bg-violet-500/10 px-1.5 py-0.5 rounded">
            Supports {`{{ var }}`}
          </span>
        </div>
        <textarea
          className={`${inputClass} resize-y`}
          rows={4}
          value={data.prompt}
          onChange={e => upd({ prompt: e.target.value })}
          placeholder="e.g., You are an HR assistant. Summarize the following candidate feedback:\n\n{{ feedback }}"
        />
      </div>

      {/* Temperature */}
      <div>
        <label className={labelClass}>
          <span className="flex items-center gap-1.5">
            <Thermometer size={11} className="text-violet-400" />
            Temperature: <span className="text-violet-300 font-mono">{data.temperature.toFixed(1)}</span>
          </span>
        </label>
        <input
          type="range"
          min={0}
          max={2}
          step={0.1}
          value={data.temperature}
          onChange={e => upd({ temperature: parseFloat(e.target.value) })}
          className="w-full accent-violet-500"
        />
        <div className="flex justify-between text-[10px] text-white/30 mt-0.5">
          <span>Precise (0)</span>
          <span>Balanced (1)</span>
          <span>Creative (2)</span>
        </div>
      </div>

      {/* Input Variables */}
      <div className="space-y-2">
        <label className={labelClass}>Input Variables</label>
        <p className="text-[10px] text-white/30 -mt-1">
          Variables injected into the prompt as <code className="text-violet-300/70 font-mono">{`{{ var }}`}</code>
        </p>
        <div className="flex gap-1.5">
          <input
            className="flex-1 text-xs border border-white/10 bg-[#12121a] text-white placeholder-white/30 rounded px-2 py-1.5 focus:ring-1 ring-violet-500 outline-none font-mono"
            placeholder="variable_name"
            value={newVar}
            onChange={e => setNewVar(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addVar(); } }}
          />
          <button
            type="button"
            onClick={addVar}
            className="flex items-center gap-1 px-2.5 text-xs text-violet-300 bg-violet-500/15 border border-violet-500/30 rounded hover:bg-violet-500/25 transition-colors"
          >
            <Plus size={11} />
          </button>
        </div>
        {data.inputVariables.length > 0 && (
          <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-white/[0.02] border border-white/5">
            {data.inputVariables.map(v => (
              <span key={v} className="inline-flex items-center gap-1 text-[10px] font-mono bg-violet-500/15 border border-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full">
                {`{{ ${v} }}`}
                <button type="button" onClick={() => removeVar(v)} className="hover:text-red-400 ml-0.5">
                  <Trash2 size={9} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Output Variable */}
      <div>
        <label className={labelClass}>Output Variable Name</label>
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-fuchsia-400/70">{`{{ `}</span>
          <input
            className="w-full text-xs border border-white/10 bg-[#12121a] text-white placeholder-white/30 rounded px-2 py-1.5 pl-7 pr-8 focus:ring-1 ring-fuchsia-500 outline-none font-mono"
            value={data.outputVariable}
            onChange={e => upd({ outputVariable: e.target.value })}
            placeholder="output_name"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-fuchsia-400/70">{` }}`}</span>
        </div>
        <p className="text-[10px] text-white/30 mt-1">
          Downstream nodes can reference this as <code className="text-fuchsia-300/70 font-mono">{`{{ ${data.outputVariable || 'output'} }}`}</code>
        </p>
      </div>
    </div>
  );
}
