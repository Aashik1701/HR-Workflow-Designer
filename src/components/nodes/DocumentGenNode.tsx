import type { Node, NodeProps } from '@xyflow/react';
import { FileText, Download } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { DocumentGenNodeData } from '../../types/workflow';

type DocumentGenFlowNode = Node<DocumentGenNodeData, 'documentGenNode'>;

const TEMPLATES: Record<string, { label: string; icon: string }> = {
  'offer_letter':   { label: 'Offer Letter',   icon: '📄' },
  'nda':            { label: 'NDA',            icon: '🔏' },
  'tax_form_w4':    { label: 'W-4 Form',       icon: '🧾' },
  'onboarding_kit': { label: 'Onboarding Kit', icon: '📦' },
  'custom':         { label: 'Custom Doc',     icon: '✏️' },
};

export function DocumentGenNode({ id, selected, data }: NodeProps<DocumentGenFlowNode>) {
  const d = data;
  const template = TEMPLATES[d.templateId] || TEMPLATES['custom'];

  return (
    <BaseNode
      id={id}
      selected={!!selected}
      hasError={d.hasError}
      errorMessage={d.errorMessage}
      accentGradient="from-cyan-400 to-blue-500"
      accentText="text-cyan-300"
      accentPill="bg-cyan-500/15 border border-cyan-500/20"
      bgGradient="bg-gradient-to-br from-cyan-500/10 to-[#181828]"
      borderGlow="border border-cyan-500/20"
      icon={<FileText size={13} />}
      label={d.title || 'Generate Document'}
      typeLabel="Doc Gen"
      subtitle="Merge data into template"
    >
      <div className="space-y-2">
        {/* Template + Format */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-300/90 bg-cyan-500/10 border border-cyan-500/15 px-2 py-0.5 rounded-lg">
            <span>{template.icon}</span>
            {template.label}
          </span>
          <span className="inline-flex items-center gap-1 text-[9px] font-black tracking-wider text-white/40 border border-white/10 px-1.5 py-0.5 rounded uppercase">
            {d.outputFormat}
          </span>
        </div>

        {/* Output file name */}
        <div className="rounded-lg bg-black/20 border border-white/5 px-2.5 py-1.5 flex items-center justify-between gap-2 overflow-hidden">
          <Download size={10} className="text-cyan-400/50 flex-shrink-0" />
          <code className="text-[9px] font-mono text-cyan-300/80 truncate flex-1">
            {d.outputFileName || 'document.pdf'}
          </code>
        </div>
        
        {/* Merge fields summary */}
        <div className="flex items-center justify-between text-[9px]">
           <span className="text-white/30">
            {d.mergeFields?.length || 0} fields mapped
          </span>
          <span className="text-white/30">
            Out: <code className="text-cyan-300/70 font-mono">{d.outputVariable || 'generated_doc'}</code>
          </span>
        </div>
      </div>
    </BaseNode>
  );
}
