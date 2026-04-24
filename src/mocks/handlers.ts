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

function interpolate(text: string, context: Record<string, string>): string {
  if (typeof text !== 'string') return text;
  return text.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (match, key) => {
    return context[key] !== undefined ? context[key] : match;
  });
}

type WorkflowMetadataEntry = {
  key?: string;
  value?: string;
};

export const handlers = [
  // GET /automations
  http.get('/api/automations', () => {
    return HttpResponse.json(AUTOMATIONS, { status: 200 });
  }),

  // POST /copilot/generate
  http.post('/api/copilot/generate', async ({ request }) => {
    const { prompt } = (await request.json()) as { prompt: string };
    const p = prompt.toLowerCase();
    
    // Simulate AI thinking time
    await new Promise((r) => setTimeout(r, 1500));

    // Base Start Node
    const nodes: WorkflowNode[] = [
      {
        id: 'node-start',
        type: 'startNode',
        position: { x: 250, y: 100 },
        data: { type: 'startNode', title: 'Auto-Generated Entry', metadata: [] },
      }
    ];
    const edges: WorkflowEdge[] = [];
    let currentY = 250;
    let prevNodeId = 'node-start';

    // Parse Keywords
    if (p.includes('email')) {
      const id = 'node-email';
      nodes.push({
        id,
        type: 'automatedStepNode',
        position: { x: 250, y: currentY },
        data: { type: 'automatedStepNode', title: 'Send Email', actionId: 'send_email', actionParams: { to: '{{ employee.email }}', subject: 'Welcome!' } }
      });
      edges.push({ id: `e-${prevNodeId}-${id}`, source: prevNodeId, target: id, type: 'smoothstep' });
      prevNodeId = id;
      currentY += 150;
    }

    if (p.includes('jira') || p.includes('ticket')) {
      const id = 'node-jira';
      nodes.push({
        id,
        type: 'automatedStepNode',
        position: { x: 250, y: currentY },
        data: { type: 'automatedStepNode', title: 'Create Ticket', actionId: 'create_ticket', actionParams: { project: 'IT', summary: 'Onboarding setup' } }
      });
      edges.push({ id: `e-${prevNodeId}-${id}`, source: prevNodeId, target: id, type: 'smoothstep' });
      prevNodeId = id;
      currentY += 150;
    }

    if (p.includes('slack') || p.includes('message')) {
      const id = 'node-slack';
      nodes.push({
        id,
        type: 'automatedStepNode',
        position: { x: 250, y: currentY },
        data: { type: 'automatedStepNode', title: 'Slack Notify', actionId: 'send_slack', actionParams: { channel: '#general', message: 'New hire!' } }
      });
      edges.push({ id: `e-${prevNodeId}-${id}`, source: prevNodeId, target: id, type: 'smoothstep' });
      prevNodeId = id;
      currentY += 150;
    }

    if (p.includes('task') || p.includes('assign')) {
      const id = 'node-task';
      nodes.push({
        id,
        type: 'taskNode',
        position: { x: 250, y: currentY },
        data: { type: 'taskNode', title: 'Manual Task', description: 'Review details', assignee: '{{ hr.manager }}', dueDate: '', customFields: [] }
      });
      edges.push({ id: `e-${prevNodeId}-${id}`, source: prevNodeId, target: id, type: 'smoothstep' });
      prevNodeId = id;
      currentY += 150;
    }

    // Always add an End Node
    const endId = 'node-end';
    nodes.push({
      id: endId,
      type: 'endNode',
      position: { x: 250, y: currentY },
      data: { type: 'endNode', endMessage: 'Generated Pipeline Complete', summaryFlag: false }
    });
    edges.push({ id: `e-${prevNodeId}-${endId}`, source: prevNodeId, target: endId, type: 'smoothstep' });

    return HttpResponse.json({ nodes, edges }, { status: 200 });
  }),

  // POST /simulate
  http.post('/api/simulate', async ({ request }) => {
    const body = (await request.json()) as { nodes: WorkflowNode[]; edges: WorkflowEdge[] };
    const { nodes, edges } = body;

    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 800));

    const executionOrder = getExecutionOrder(nodes, edges);
    
    // Context dictionary for variable interpolation
    const context: Record<string, string> = {};

    const steps = executionOrder.map((node, index: number) => {
      const nodeType = node.type ?? node.data.type;
      let stepMessage = getStepMessage(nodeType, node);

      // Extract initial variables from start node
      if (nodeType === 'startNode' && Array.isArray(node.data.metadata)) {
        node.data.metadata.forEach((kv) => {
          const metadata = kv as WorkflowMetadataEntry;
          if (metadata.key && metadata.value) {
            context[metadata.key] = metadata.value;
          }
        });
      }

      // Interpolate automated step parameters
      if (nodeType === 'automatedStepNode' && node.data.actionParams) {
        const actionParams = node.data.actionParams as Record<string, string>;
        const interpolatedParams = Object.entries(actionParams)
          .map(([key, val]) => `${key}: "${interpolate(val, context)}"`)
          .join(', ');
        
        stepMessage = `Executed Action: { ${interpolatedParams} }`;
      }

      // Interpolate task descriptions/assignees
      if (nodeType === 'taskNode') {
        const assignee = interpolate((node.data.assignee as string) ?? '', context);
        stepMessage = `Task assigned to ${assignee || 'unassigned'} and queued`;
      }

      return {
        nodeId: node.id,
        nodeType,
        nodeTitle: getNodeTitle(node),
        status: 'success' as const,
        message: stepMessage,
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
  const outgoingEdges = new Map<string, WorkflowEdge[]>();

  nodes.forEach((node) => {
    nodeById.set(node.id, node);
    outgoingEdges.set(node.id, []);
  });

  edges.forEach((edge) => {
    outgoingEdges.get(edge.source)?.push(edge);
  });

  const startNode = nodes.find(n => n.type === 'startNode') ?? nodes[0];
  if (!startNode) return [];

  const orderedIds: string[] = [];
  const queue: string[] = [startNode.id];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (!currentId) break;
    if (visited.has(currentId)) continue;
    
    visited.add(currentId);
    orderedIds.push(currentId);

    const currentNode = nodeById.get(currentId);
    const edgesFromHere = outgoingEdges.get(currentId) ?? [];

    if (currentNode?.type === 'splitNode') {
      // Simulate A/B test routing by randomly picking Path A or Path B
      const isPathA = Math.random() > 0.5;
      const targetHandle = isPathA ? 'pathA' : 'pathB';
      const selectedEdge = edgesFromHere.find(e => e.sourceHandle === targetHandle) ?? edgesFromHere[0];
      
      if (selectedEdge && !visited.has(selectedEdge.target)) {
        queue.push(selectedEdge.target);
      }
    } else {
      // Normal routing: enqueue all targets
      for (const edge of edgesFromHere) {
        if (!visited.has(edge.target)) {
          queue.push(edge.target);
        }
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

function getStepMessage(nodeType: NodeType, node?: WorkflowNode): string {
  if (nodeType === 'delayNode') {
    const duration = node?.data?.duration ?? 1;
    const unit = node?.data?.unit ?? 'days';
    return `Execution paused for ${duration} ${unit}.`;
  }
  
  if (nodeType === 'splitNode') {
    return 'Traffic routed down selected A/B test path.';
  }

  const messages: Record<string, string> = {
    startNode: 'Payload initialized with provided metadata variables.',
    taskNode: 'Task assigned and queued for completion.',
    approvalNode: 'Approval request routed to designated approver.',
    automatedStepNode: 'Automated action triggered.',
    endNode: 'Workflow completed. Pipeline summary generated.',
  };
  return messages[nodeType as string] ?? 'Step executed';
}
