import { http, HttpResponse } from 'msw';
import type { AutomationAction, SimulationResult } from '../types/workflow';

const AUTOMATIONS: AutomationAction[] = [
  { id: 'send_email', label: 'Send Email', params: ['to', 'subject', 'body'] },
  { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'] },
  { id: 'send_slack', label: 'Send Slack Message', params: ['channel', 'message'] },
  { id: 'create_ticket', label: 'Create JIRA Ticket', params: ['project', 'summary'] },
  { id: 'webhook', label: 'Trigger Webhook', params: ['url', 'method'] },
];

export const handlers = [
  // GET /automations
  http.get('/api/automations', () => {
    return HttpResponse.json(AUTOMATIONS, { status: 200 });
  }),

  // POST /simulate
  http.post('/api/simulate', async ({ request }) => {
    const body = (await request.json()) as { nodes: Record<string, unknown>[]; edges: unknown[] };
    const { nodes } = body;

    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 800));

    const steps = nodes.map((node: Record<string, unknown>, index: number) => ({
      nodeId: node.id as string,
      nodeType: node.type as string,
      nodeTitle: (node.data as Record<string, unknown>)?.title as string || node.type as string,
      status: 'success' as const,
      message: getStepMessage(node.type as string),
      timestamp: new Date(Date.now() + index * 500).toISOString(),
      durationMs: Math.floor(Math.random() * 400) + 100,
    }));

    const result: SimulationResult = {
      success: true,
      totalSteps: steps.length,
      executedSteps: steps,
      errors: [],
      completedAt: new Date().toISOString(),
    };

    return HttpResponse.json(result, { status: 200 });
  }),
];

function getStepMessage(nodeType: string): string {
  const messages: Record<string, string> = {
    startNode: 'Workflow initiated successfully',
    taskNode: 'Task assigned and queued for completion',
    approvalNode: 'Approval request sent to designated approver',
    automatedStepNode: 'Automated action triggered and executed',
    endNode: 'Workflow completed. Summary generated.',
  };
  return messages[nodeType] ?? 'Step executed';
}
