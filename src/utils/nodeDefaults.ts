import type { NodeType, WorkflowNodeData } from '../types/workflow';

export function getDefaultNodeData(type: NodeType): WorkflowNodeData {
  switch (type) {
    case 'startNode':
      return {
        type: 'startNode',
        title: 'Start',
        metadata: [],
        triggerType: 'manual',
        triggerConfig: {},
      };
    case 'taskNode':
      return { type: 'taskNode', title: 'New Task', description: '', assignee: '', dueDate: '', customFields: [] };
    case 'approvalNode':
      return { type: 'approvalNode', title: 'Approval Required', approverRole: 'Manager', autoApproveThreshold: 0 };
    case 'automatedStepNode':
      return {
        type: 'automatedStepNode',
        title: 'Automated Step',
        actionId: '',
        actionParams: {},
        reliability: {
          retryPolicy: { maxRetries: 1, backoffMs: 500, strategy: 'fixed' },
          timeoutMs: 5000,
          deadLetterQueue: { enabled: false, queueName: 'automation_dead_letter' },
          onFailure: { mode: 'continue' },
        },
      };
    case 'splitNode':
      return { type: 'splitNode', title: 'A/B Split', pathALabel: 'Path A', pathBLabel: 'Path B', splitPercentage: 50 };
    case 'delayNode':
      return { type: 'delayNode', title: 'Wait', duration: 1, unit: 'days' };
    case 'endNode':
      return { type: 'endNode', endMessage: 'Workflow complete', summaryFlag: false };
  }
}
