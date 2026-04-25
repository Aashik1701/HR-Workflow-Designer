import type { Node, NodeProps } from '@xyflow/react';
import { Zap, Mail, MessageSquare, Ticket, FileText, Database, CalendarCheck, Webhook } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { AutomatedStepNodeData } from '../../types/workflow';

type AutomatedStepFlowNode = Node<AutomatedStepNodeData, 'automatedStepNode'>;

const ACTION_META: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  send_email:       { icon: <Mail size={13} />,         label: 'Email',     color: 'text-sky-300 bg-sky-500/15 border-sky-500/20' },
  send_slack:       { icon: <MessageSquare size={13} />, label: 'Slack',     color: 'text-teal-300 bg-teal-500/15 border-teal-500/20' },
  create_ticket:    { icon: <Ticket size={13} />,        label: 'Jira',      color: 'text-blue-300 bg-blue-500/15 border-blue-500/20' },
  generate_doc:     { icon: <FileText size={13} />,      label: 'Doc',       color: 'text-amber-300 bg-amber-500/15 border-amber-500/20' },
  update_record:    { icon: <Database size={13} />,      label: 'DB',        color: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/20' },
  schedule_meeting: { icon: <CalendarCheck size={13} />, label: 'Calendar',  color: 'text-blue-300 bg-blue-500/15 border-blue-500/20' },
  trigger_webhook:  { icon: <Webhook size={13} />,       label: 'Webhook',   color: 'text-rose-300 bg-rose-500/15 border-rose-500/20' },
};

export function AutomatedStepNode({ id, selected, data }: NodeProps<AutomatedStepFlowNode>) {
  const d = data;
  const meta = ACTION_META[d.actionId] ?? { icon: <Zap size={13} />, label: d.actionId, color: 'text-blue-300 bg-blue-500/15 border-blue-500/20' };

  return (
    <BaseNode
      id={id}
      selected={!!selected}
      hasError={d.hasError}
      errorMessage={d.errorMessage}
      accentGradient="from-blue-500 to-teal-500"
      accentText="text-blue-300"
      accentPill="bg-blue-500/15 border border-blue-500/20"
      bgGradient="bg-gradient-to-br from-blue-500/10 to-[#181828]"
      borderGlow="border border-blue-500/20"
      icon={meta.icon}
      label={d.title || 'Automated Step'}
      typeLabel="Action"
      subtitle="System automation"
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-lg border ${meta.color}`}>
          {meta.icon}
          {meta.label}
        </span>
        <code className="text-[9px] text-white/30 font-mono truncate max-w-[80px]">{d.actionId}</code>
      </div>
    </BaseNode>
  );
}
