import { http, HttpResponse } from 'msw';
import type {
  AutomationAction,
  NodeType,
  SimulationResult,
  WorkflowEdge,
  WorkflowNode,
} from '../types/workflow';

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
    const body = (await request.json()) as { nodes: WorkflowNode[]; edges: WorkflowEdge[] };
    const { nodes, edges } = body;

    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 800));

    const executionOrder = getExecutionOrder(nodes, edges);

    const steps = executionOrder.map((node, index: number) => {
      const nodeType = node.type ?? node.data.type;

      return {
        nodeId: node.id,
        nodeType,
        nodeTitle: getNodeTitle(node),
        status: 'success' as const,
        message: getStepMessage(nodeType),
        timestamp: new Date(Date.now() + index * 500).toISOString(),
        durationMs: Math.floor(Math.random() * 400) + 100,
      };
    });

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

function getExecutionOrder(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowNode[] {
  const nodeById = new Map<string, WorkflowNode>();
  const adjacency = new Map<string, string[]>();
  const indegree = new Map<string, number>();

  nodes.forEach((node) => {
    nodeById.set(node.id, node);
    adjacency.set(node.id, []);
    indegree.set(node.id, 0);
  });

  edges.forEach((edge) => {
    if (!nodeById.has(edge.source) || !nodeById.has(edge.target)) return;
    adjacency.get(edge.source)?.push(edge.target);
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1);
  });

  const queue: string[] = nodes
    .map((node) => node.id)
    .filter((nodeId) => (indegree.get(nodeId) ?? 0) === 0);

  const orderedIds: string[] = [];

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (!currentId) break;

    orderedIds.push(currentId);

    for (const neighbor of adjacency.get(currentId) ?? []) {
      const nextIndegree = (indegree.get(neighbor) ?? 1) - 1;
      indegree.set(neighbor, nextIndegree);
      if (nextIndegree === 0) {
        queue.push(neighbor);
      }
    }
  }

  if (orderedIds.length < nodes.length) {
    for (const node of nodes) {
      if (!orderedIds.includes(node.id)) {
        orderedIds.push(node.id);
      }
    }
  }

  return orderedIds
    .map((nodeId) => nodeById.get(nodeId))
    .filter((node): node is WorkflowNode => Boolean(node));
}

function getNodeTitle(node: WorkflowNode): string {
  const title = node.data.title;
  if (typeof title === 'string' && title.trim().length > 0) {
    return title;
  }

  const endMessage = node.data.endMessage;
  if (typeof endMessage === 'string' && endMessage.trim().length > 0) {
    return endMessage;
  }

  return node.type ?? node.id;
}

function getStepMessage(nodeType: NodeType): string {
  const messages: Record<NodeType, string> = {
    startNode: 'Workflow initiated successfully',
    taskNode: 'Task assigned and queued for completion',
    approvalNode: 'Approval request sent to designated approver',
    automatedStepNode: 'Automated action triggered and executed',
    endNode: 'Workflow completed. Summary generated.',
  };
  return messages[nodeType] ?? 'Step executed';
}
