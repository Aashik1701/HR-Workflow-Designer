import type { NodeType, WorkflowNodeData } from '../types/workflow';

export function getDefaultNodeData(type: NodeType): WorkflowNodeData {
  switch (type) {
    case 'startNode':
      return { type: 'startNode', title: 'Start', metadata: [] };
    case 'taskNode':
      return { type: 'taskNode', title: 'New Task', description: '', assignee: '', dueDate: '', customFields: [] };
    case 'approvalNode':
      return { type: 'approvalNode', title: 'Approval Required', approverRole: 'Manager', autoApproveThreshold: 0 };
    case 'automatedStepNode':
      return { type: 'automatedStepNode', title: 'Automated Step', actionId: '', actionParams: {} };
    case 'splitNode':
      return { type: 'splitNode', title: 'A/B Split', pathALabel: 'Path A', pathBLabel: 'Path B', splitPercentage: 50 };
    case 'delayNode':
      return { type: 'delayNode', title: 'Wait', duration: 1, unit: 'days' };
    case 'endNode':
      return { type: 'endNode', endMessage: 'Workflow complete', summaryFlag: false };
  }
}
