import type { Node, NodeProps } from '@xyflow/react';
import { Sparkles, Thermometer } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { AIActionNodeData } from '../../types/workflow';

type AIActionFlowNode = Node<AIActionNodeData, 'aiActionNode'>;

const MODEL_META: Record<string, { label: string; color: string }> = {
  'gpt-4o':         { label: 'GPT-4o',         color: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/20' },
  'gpt-4o-mini':    { label: 'GPT-4o Mini',    color: 'text-teal-300 bg-teal-500/15 border-teal-500/20' },
  'claude-sonnet':  { label: 'Claude Sonnet',   color: 'text-amber-300 bg-amber-500/15 border-amber-500/20' },
  'gemini-pro':     { label: 'Gemini Pro',      color: 'text-blue-300 bg-blue-500/15 border-blue-500/20' },
};

export function AIActionNode({ id, selected, data }: NodeProps<AIActionFlowNode>) {
  const d = data;
  const model = MODEL_META[d.model] ?? { label: d.model, color: 'text-violet-300 bg-violet-500/15 border-violet-500/20' };

  return (
    <BaseNode
      id={id}
      selected={!!selected}
      hasError={d.hasError}
      errorMessage={d.errorMessage}
      accentGradient="from-violet-400 to-fuchsia-500"
      accentText="text-violet-300"
      accentPill="bg-violet-500/15 border border-violet-500/20"
      bgGradient="bg-gradient-to-br from-violet-500/10 to-[#181828]"
      borderGlow="border border-violet-500/20"
      icon={<Sparkles size={13} />}
      label={d.title || 'AI Action'}
      typeLabel="AI"
      subtitle="LLM processing step"
    >
      <div className="space-y-2">
        {/* Model + Temperature */}
        <div className="flex items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-lg border ${model.color}`}>
            <Sparkles size={9} />
            {model.label}
          </span>
          <span className="inline-flex items-center gap-1 text-[9px] text-white/40">
            <Thermometer size={9} />
            {d.temperature}
          </span>
        </div>

        {/* Prompt preview */}
        <div className="rounded-lg bg-black/20 border border-white/5 px-2 py-1.5">
          <p className="text-[9px] text-white/50 leading-relaxed line-clamp-2 italic">
            "{d.prompt}"
          </p>
        </div>

        {/* Variables */}
        <div className="flex items-center justify-between text-[9px]">
          <span className="text-white/30">
            In: <code className="text-violet-300/70 font-mono">{d.inputVariables?.join(', ') || '—'}</code>
          </span>
          <span className="text-white/30">
            Out: <code className="text-fuchsia-300/70 font-mono">{d.outputVariable || '—'}</code>
          </span>
        </div>
      </div>
    </BaseNode>
  );
}
