import { FileText, Plus, Trash2 } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import type { DocumentGenNodeData } from '../../types/workflow';

interface Props { nodeId: string; data: DocumentGenNodeData; }

const TEMPLATES = [
  { id: 'offer_letter',    label: 'Offer Letter',      emoji: '📄' },
  { id: 'nda',             label: 'NDA Agreement',     emoji: '🔏' },
  { id: 'tax_form_w4',     label: 'Tax Form (W-4)',    emoji: '🧾' },
  { id: 'onboarding_kit',  label: 'Onboarding Kit',    emoji: '📦' },
  { id: 'custom',          label: 'Custom Template',   emoji: '✏️' },
];

const OUTPUT_FORMATS = ['PDF', 'DOCX', 'HTML'] as const;

export function DocumentGenNodeForm({ nodeId, data }: Props) {
  const { updateNodeData } = useWorkflowStore();

  const inputClass =
    'w-full text-xs border border-white/10 bg-[#12121a] text-white placeholder-white/30 rounded px-2 py-1.5 focus:ring-1 ring-cyan-500 outline-none';
  const labelClass = 'block text-xs font-medium text-white/70 mb-1';

  const upd = (patch: Partial<DocumentGenNodeData>) =>
    updateNodeData(nodeId, { ...data, ...patch });

  const addField = () =>
    upd({ mergeFields: [...(data.mergeFields ?? []), { key: '', value: '' }] });

  const removeField = (i: number) =>
    upd({ mergeFields: data.mergeFields.filter((_, idx) => idx !== i) });

  const updateField = (i: number, side: 'key' | 'value', v: string) => {
    const next = [...data.mergeFields];
    next[i] = { ...next[i], [side]: v };
    upd({ mergeFields: next });
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
          placeholder="e.g., Generate Offer Letter"
        />
      </div>

      {/* Template picker */}
      <div>
        <label className={labelClass}>Document Template</label>
        <div className="space-y-1.5">
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => upd({ templateId: t.id })}
              className={`w-full flex items-center gap-2.5 text-xs font-medium px-3 py-2 rounded-lg border transition-all text-left ${
                data.templateId === t.id
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 ring-1 ring-cyan-500/30'
                  : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20 hover:text-white/70'
              }`}
            >
              <span className="text-base leading-none">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>
        {/* Custom template URL if "custom" is chosen */}
        {data.templateId === 'custom' && (
          <div className="mt-2">
            <label className={labelClass}>Custom Template URL / Path</label>
            <input
              className={inputClass}
              value={data.customTemplateUrl ?? ''}
              onChange={e => upd({ customTemplateUrl: e.target.value })}
              placeholder="https://example.com/templates/my-doc.docx"
            />
          </div>
        )}
      </div>

      {/* Document file name */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-white/70">Output File Name</label>
          <span className="text-[9px] text-cyan-400/70 font-mono bg-cyan-500/10 px-1.5 py-0.5 rounded">
            Supports {`{{ var }}`}
          </span>
        </div>
        <input
          className={inputClass}
          value={data.outputFileName}
          onChange={e => upd({ outputFileName: e.target.value })}
          placeholder={`e.g., offer_{{ candidate_name }}.pdf`}
        />
      </div>

      {/* Output format */}
      <div>
        <label className={labelClass}>Output Format</label>
        <div className="flex gap-2">
          {OUTPUT_FORMATS.map(fmt => (
            <button
              key={fmt}
              type="button"
              onClick={() => upd({ outputFormat: fmt })}
              className={`flex-1 text-xs font-bold py-2 rounded-lg border transition-all ${
                data.outputFormat === fmt
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Merge Fields */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-white/70 flex items-center gap-1.5">
            <FileText size={11} className="text-cyan-400" />
            Merge Fields
          </label>
          <button
            type="button"
            onClick={addField}
            className="flex items-center gap-1 text-[10px] text-cyan-300/80 hover:text-cyan-300"
          >
            <Plus size={10} /> Add Field
          </button>
        </div>
        <p className="text-[10px] text-white/30">
          Map template placeholders to values or{' '}
          <code className="text-cyan-300/70 font-mono">{`{{ variables }}`}</code>.
        </p>
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2 space-y-1.5">
          {(data.mergeFields ?? []).length === 0 && (
            <p className="text-[10px] text-white/30 text-center py-2">
              No merge fields defined yet.
            </p>
          )}
          {(data.mergeFields ?? []).map((pair, i) => (
            <div key={i} className="flex gap-1.5 items-center">
              <input
                className="flex-1 text-xs border border-white/10 bg-[#12121a] text-white placeholder-white/30 rounded px-2 py-1 focus:ring-1 ring-cyan-500 outline-none font-mono"
                placeholder="{{placeholder}}"
                value={pair.key}
                onChange={e => updateField(i, 'key', e.target.value)}
              />
              <span className="text-[10px] text-white/30">→</span>
              <input
                className="flex-1 text-xs border border-white/10 bg-[#12121a] text-white placeholder-white/30 rounded px-2 py-1 focus:ring-1 ring-cyan-500 outline-none"
                placeholder={`{{ candidate_name }}`}
                value={pair.value}
                onChange={e => updateField(i, 'value', e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeField(i)}
                className="text-white/30 hover:text-red-400 transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Output variable name */}
      <div>
        <label className={labelClass}>Output Variable (for downstream nodes)</label>
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-cyan-400/70">{`{{ `}</span>
          <input
            className="w-full text-xs border border-white/10 bg-[#12121a] text-white placeholder-white/30 rounded px-2 py-1.5 pl-7 pr-8 focus:ring-1 ring-cyan-500 outline-none font-mono"
            value={data.outputVariable}
            onChange={e => upd({ outputVariable: e.target.value })}
            placeholder="generated_doc"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-cyan-400/70">{` }}`}</span>
        </div>
        <p className="text-[10px] text-white/30 mt-1">
          Pass{' '}
          <code className="text-cyan-300/70 font-mono">{`{{ ${data.outputVariable || 'generated_doc'} }}`}</code>{' '}
          as an attachment to an email or approval node.
        </p>
      </div>
    </div>
  );
}
