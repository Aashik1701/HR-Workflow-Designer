import type {
  NodeType,
  SimulationResult,
  WorkflowEdge,
  WorkflowNode,
} from '../types/workflow';

// ─── Local simulation engine (no MSW needed) ──────────────────────────────────

export async function simulateWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): Promise<SimulationResult> {
  // Simulate async processing delay
  await new Promise((r) => setTimeout(r, 800));

  const executionOrder = getExecutionOrder(nodes, edges);

  const steps = executionOrder.map((node, index: number) => {
    const nodeType = (node.type ?? (node.data as { type?: string }).type) as NodeType;
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

  return {
    success: true,
    totalSteps: steps.length,
    executedSteps: steps,
    errors: [],
    completedAt: new Date().toISOString(),
  };
}

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
      if (nextIndegree === 0) queue.push(neighbor);
    }
  }

  // Append any disconnected nodes
  for (const node of nodes) {
    if (!orderedIds.includes(node.id)) orderedIds.push(node.id);
  }

  return orderedIds
    .map((nodeId) => nodeById.get(nodeId))
    .filter((node): node is WorkflowNode => Boolean(node));
}

function getNodeTitle(node: WorkflowNode): string {
  const data = node.data as Record<string, unknown>;
  if (typeof data.title === 'string' && data.title.trim().length > 0) return data.title;
  if (typeof data.endMessage === 'string' && data.endMessage.trim().length > 0) return data.endMessage;
  return node.type ?? node.id;
}

function getStepMessage(nodeType: NodeType): string {
  const messages: Record<NodeType, string> = {
    startNode: 'Workflow initiated successfully',
    taskNode: 'Task assigned and queued for completion',
    approvalNode: 'Approval request sent to designated approver',
    automatedStepNode: 'Automated action triggered and executed',
    splitNode: 'Conditional branch evaluated and routed',
    delayNode: 'Execution paused until delay window elapsed',
    endNode: 'Workflow completed. Summary generated.',
  };
  return messages[nodeType] ?? 'Step executed';
}
