import type {
  ValidationResult,
  ValidationError,
  WorkflowEdge,
  WorkflowNode,
} from '../types/workflow';

export function validateWorkflow(nodes: WorkflowNode[], edges: WorkflowEdge[]): ValidationResult {
  const errors: ValidationError[] = [];

  if (nodes.length === 0) {
    return { isValid: false, errors: [{ nodeId: '', message: 'Workflow is empty' }] };
  }

  const nodeIds = new Set(nodes.map((node) => node.id));
  const validEdges = edges.filter(
    (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target)
  );

  const duplicateNodeIds = findDuplicates(nodes.map((node) => node.id));
  if (duplicateNodeIds.length > 0) {
    errors.push({
      nodeId: '',
      message: `Duplicate node id(s): ${duplicateNodeIds.join(', ')}`,
    });
  }

  edges.forEach((edge) => {
    if (!nodeIds.has(edge.source)) {
      errors.push({
        nodeId: '',
        message: `Edge "${edge.id}" references unknown source node "${edge.source}"`,
      });
    }

    if (!nodeIds.has(edge.target)) {
      errors.push({
        nodeId: '',
        message: `Edge "${edge.id}" references unknown target node "${edge.target}"`,
      });
    }
  });

  // Rule 1: Exactly one Start node
  const startNodes = nodes.filter((n) => n.type === 'startNode');
  if (startNodes.length === 0) errors.push({ nodeId: '', message: 'No Start node found' });
  if (startNodes.length > 1) errors.push({ nodeId: '', message: 'Multiple Start nodes found' });

  // Rule 2: At least one End node
  const endNodes = nodes.filter((n) => n.type === 'endNode');
  if (endNodes.length === 0) errors.push({ nodeId: '', message: 'No End node found' });

  // Rule 3: All non-start nodes must have at least one incoming edge
  nodes.forEach((node) => {
    if (node.type === 'startNode') return;
    const hasIncoming = validEdges.some((e) => e.target === node.id);
    if (!hasIncoming) {
      errors.push({
        nodeId: node.id,
        message: `"${getNodeLabel(node)}" has no incoming connection`,
      });
    }
  });

  // Rule 4: All non-end nodes must have at least one outgoing edge
  nodes.forEach((node) => {
    if (node.type === 'endNode') return;
    const hasOutgoing = validEdges.some((e) => e.source === node.id);
    if (!hasOutgoing) {
      errors.push({
        nodeId: node.id,
        message: `"${getNodeLabel(node)}" has no outgoing connection`,
      });
    }
  });

  // Rule 5: All nodes should be reachable from Start when workflow has exactly one start.
  if (startNodes.length === 1) {
    const reachableNodeIds = getReachableNodeIds(startNodes[0].id, nodes, validEdges);

    nodes.forEach((node) => {
      if (!reachableNodeIds.has(node.id)) {
        errors.push({
          nodeId: node.id,
          message: `"${getNodeLabel(node)}" is disconnected from Start`,
        });
      }
    });

    const hasReachableEndNode = endNodes.some((node) => reachableNodeIds.has(node.id));
    if (endNodes.length > 0 && !hasReachableEndNode) {
      errors.push({
        nodeId: '',
        message: 'No End node is reachable from Start',
      });
    }
  }

  // Rule 6: Cycle detection (DFS)
  const hasCycle = detectCycle(nodes, validEdges);
  if (hasCycle) errors.push({ nodeId: '', message: 'Workflow contains a cycle' });

  return { isValid: errors.length === 0, errors };
}

function detectCycle(nodes: WorkflowNode[], edges: WorkflowEdge[]): boolean {
  const adj: Record<string, string[]> = {};
  nodes.forEach((n) => {
    adj[n.id] = [];
  });

  const validNodeIds = new Set(nodes.map((node) => node.id));
  edges.forEach((e) => {
    if (validNodeIds.has(e.source) && validNodeIds.has(e.target)) {
      adj[e.source]?.push(e.target);
    }
  });

  const visited = new Set<string>();
  const inStack = new Set<string>();

  function dfs(id: string): boolean {
    visited.add(id);
    inStack.add(id);
    for (const neighbor of adj[id] ?? []) {
      if (!visited.has(neighbor) && dfs(neighbor)) return true;
      if (inStack.has(neighbor)) return true;
    }
    inStack.delete(id);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id) && dfs(node.id)) return true;
  }
  return false;
}

function getReachableNodeIds(
  startNodeId: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): Set<string> {
  const adjacency: Record<string, string[]> = {};
  nodes.forEach((node) => {
    adjacency[node.id] = [];
  });

  edges.forEach((edge) => {
    if (adjacency[edge.source]) {
      adjacency[edge.source].push(edge.target);
    }
  });

  const visited = new Set<string>();
  const queue: string[] = [startNodeId];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current)) continue;
    visited.add(current);
    for (const neighbor of adjacency[current] ?? []) {
      if (!visited.has(neighbor)) {
        queue.push(neighbor);
      }
    }
  }

  return visited;
}

function getNodeLabel(node: WorkflowNode): string {
  const data = node.data as Record<string, unknown>;
  if (typeof data.title === 'string' && data.title.trim().length > 0) {
    return data.title;
  }

  if (typeof data.endMessage === 'string' && data.endMessage.trim().length > 0) {
    return data.endMessage;
  }

  return node.type ?? node.id;
}

function findDuplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  values.forEach((value) => {
    if (seen.has(value)) {
      duplicates.add(value);
    } else {
      seen.add(value);
    }
  });

  return [...duplicates];
}
