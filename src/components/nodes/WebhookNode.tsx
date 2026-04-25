import type { Node, NodeProps } from '@xyflow/react';
import { Webhook, Shield, ShieldOff, Key } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { WebhookNodeData } from '../../types/workflow';

type WebhookFlowNode = Node<WebhookNodeData, 'webhookNode'>;

const METHOD_COLORS: Record<string, string> = {
  GET:  'text-emerald-300 bg-emerald-500/15 border-emerald-500/20',
  POST: 'text-blue-300 bg-blue-500/15 border-blue-500/20',
  PUT:  'text-amber-300 bg-amber-500/15 border-amber-500/20',
};

const AUTH_ICONS: Record<string, React.ReactNode> = {
  none:   <ShieldOff size={10} />,
  bearer: <Shield size={10} />,
  apiKey: <Key size={10} />,
};

export function WebhookNode({ id, selected, data }: NodeProps<WebhookFlowNode>) {
  const d = data;
  const methodColor = METHOD_COLORS[d.httpMethod] ?? METHOD_COLORS.POST;

  return (
    <BaseNode
      id={id}
      selected={!!selected}
      hasError={d.hasError}
      errorMessage={d.errorMessage}
      accentGradient="from-orange-400 to-rose-500"
      accentText="text-orange-300"
      accentPill="bg-orange-500/15 border border-orange-500/20"
      bgGradient="bg-gradient-to-br from-orange-500/10 to-[#181828]"
      borderGlow="border border-orange-500/20"
      icon={<Webhook size={13} />}
      label={d.title || 'Webhook Trigger'}
      typeLabel="Webhook"
      subtitle="External trigger endpoint"
      showTargetHandle={false}
    >
      <div className="space-y-2">
        {/* Method + URL */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${methodColor}`}>
            {d.httpMethod}
          </span>
          <code className="text-[9px] text-white/50 font-mono truncate flex-1">{d.webhookUrl}</code>
        </div>

        {/* Auth + Schema count */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[9px] text-white/40">
            {AUTH_ICONS[d.authType]}
            <span className="uppercase tracking-wider font-semibold">{d.authType}</span>
          </span>
          <span className="text-[9px] text-white/30">
            {d.payloadSchema?.length ?? 0} field{(d.payloadSchema?.length ?? 0) !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </BaseNode>
  );
}
