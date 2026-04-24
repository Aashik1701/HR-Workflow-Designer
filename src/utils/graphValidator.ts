import type { Node, Edge } from '@xyflow/react';
import type { ValidationResult, ValidationError } from '../types/workflow';

export function validateWorkflow(nodes: Node[], edges: Edge[]): ValidationResult {
  const errors: ValidationError[] = [];

  if (nodes.length === 0) {
    return { isValid: false, errors: [{ nodeId: '', message: 'Workflow is empty' }] };
  }

  // Rule 1: Exactly one Start node
  const startNodes = nodes.filter(n => n.type === 'startNode');
  if (startNodes.length === 0) errors.push({ nodeId: '', message: 'No Start node found' });
  if (startNodes.length > 1) errors.push({ nodeId: '', message: 'Multiple Start nodes found' });

  // Rule 2: At least one End node
  const endNodes = nodes.filter(n => n.type === 'endNode');
  if (endNodes.length === 0) errors.push({ nodeId: '', message: 'No End node found' });

  // Rule 3: All non-start nodes must have at least one incoming edge
  nodes.forEach(node => {
    if (node.type === 'startNode') return;
    const hasIncoming = edges.some(e => e.target === node.id);
    if (!hasIncoming) {
      errors.push({ nodeId: node.id, message: `"${(node.data as Record<string, unknown>)?.title || node.type}" has no incoming connection` });
    }
  });

  // Rule 4: All non-end nodes must have at least one outgoing edge
  nodes.forEach(node => {
    if (node.type === 'endNode') return;
    const hasOutgoing = edges.some(e => e.source === node.id);
    if (!hasOutgoing) {
      errors.push({ nodeId: node.id, message: `"${(node.data as Record<string, unknown>)?.title || node.type}" has no outgoing connection` });
    }
  });

  // Rule 5: Cycle detection (DFS)
  const hasCycle = detectCycle(nodes, edges);
  if (hasCycle) errors.push({ nodeId: '', message: 'Workflow contains a cycle' });

  return { isValid: errors.length === 0, errors };
}

function detectCycle(nodes: Node[], edges: Edge[]): boolean {
  const adj: Record<string, string[]> = {};
  nodes.forEach(n => (adj[n.id] = []));
  edges.forEach(e => adj[e.source]?.push(e.target));

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
