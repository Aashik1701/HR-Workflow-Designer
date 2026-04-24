import { describe, expect, it } from 'vitest';
import { validateWorkflow } from '../src/utils/graphValidator';
import type { WorkflowEdge, WorkflowNode } from '../src/types/workflow';

const startNode: WorkflowNode = {
  id: 'start-1',
  type: 'startNode',
  position: { x: 0, y: 0 },
  data: {
    type: 'startNode',
    title: 'Start',
    metadata: [],
  },
};

const taskNode: WorkflowNode = {
  id: 'task-1',
  type: 'taskNode',
  position: { x: 200, y: 120 },
  data: {
    type: 'taskNode',
    title: 'Collect Docs',
    description: '',
    assignee: '',
    dueDate: '',
    customFields: [],
  },
};

const endNode: WorkflowNode = {
  id: 'end-1',
  type: 'endNode',
  position: { x: 400, y: 240 },
  data: {
    type: 'endNode',
    endMessage: 'Complete',
    summaryFlag: false,
  },
};

function edge(id: string, source: string, target: string): WorkflowEdge {
  return { id, source, target };
}

describe('validateWorkflow', () => {
  it('accepts a valid linear workflow', () => {
    const nodes: WorkflowNode[] = [startNode, taskNode, endNode];
    const edges: WorkflowEdge[] = [
      edge('e-start-task', 'start-1', 'task-1'),
      edge('e-task-end', 'task-1', 'end-1'),
    ];

    const result = validateWorkflow(nodes, edges);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('flags cyclic workflows', () => {
    const nodes: WorkflowNode[] = [startNode, taskNode, endNode];
    const edges: WorkflowEdge[] = [
      edge('e-start-task', 'start-1', 'task-1'),
      edge('e-task-end', 'task-1', 'end-1'),
      edge('e-end-task', 'end-1', 'task-1'),
    ];

    const result = validateWorkflow(nodes, edges);

    expect(result.isValid).toBe(false);
    expect(result.errors.some((error) => error.message.includes('contains a cycle'))).toBe(true);
  });

  it('flags nodes disconnected from Start', () => {
    const isolatedTask: WorkflowNode = {
      id: 'task-2',
      type: 'taskNode',
      position: { x: 640, y: 120 },
      data: {
        type: 'taskNode',
        title: 'Orphan Task',
        description: '',
        assignee: '',
        dueDate: '',
        customFields: [],
      },
    };

    const nodes: WorkflowNode[] = [startNode, taskNode, isolatedTask, endNode];
    const edges: WorkflowEdge[] = [
      edge('e-start-task', 'start-1', 'task-1'),
      edge('e-task-end', 'task-1', 'end-1'),
    ];

    const result = validateWorkflow(nodes, edges);

    expect(result.isValid).toBe(false);
    expect(result.errors.some((error) => error.message.includes('disconnected from Start'))).toBe(true);
  });

  it('flags edges that reference missing nodes', () => {
    const nodes: WorkflowNode[] = [startNode, taskNode, endNode];
    const edges: WorkflowEdge[] = [
      edge('e-start-task', 'start-1', 'task-1'),
      edge('e-task-end', 'task-1', 'end-1'),
      edge('e-broken', 'missing-source', 'end-1'),
    ];

    const result = validateWorkflow(nodes, edges);

    expect(result.isValid).toBe(false);
    expect(
      result.errors.some((error) =>
        error.message.includes('references unknown source node "missing-source"')
      )
    ).toBe(true);
  });
});
