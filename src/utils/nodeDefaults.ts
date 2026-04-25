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
    case 'webhookNode':
      return {
        type: 'webhookNode',
        title: 'Webhook Trigger',
        webhookUrl: '/api/webhook/' + Math.random().toString(36).substring(2, 10),
        httpMethod: 'POST',
        payloadSchema: [{ key: 'candidate_id', value: 'string' }],
        authType: 'none',
        authToken: '',
      };
    case 'aiActionNode':
      return {
        type: 'aiActionNode',
        title: 'AI Action',
        model: 'gpt-4o',
        prompt: 'Summarize the following candidate feedback...',
        inputVariables: ['feedback'],
        outputVariable: 'summary',
        temperature: 0.7,
      };
    case 'forkNode':
      return {
        type: 'forkNode',
        title: 'Parallel Fork',
        mode: 'fork',
        branches: 2,
        branchLabels: ['Branch 1', 'Branch 2'],
      };
    case 'loopNode':
      return {
        type: 'loopNode',
        title: 'Loop Iterator',
        iteratorSource: 'candidates',
        maxIterations: 100,
        currentItemVariable: 'item',
      };
    case 'documentGenNode':
      return {
        type: 'documentGenNode',
        title: 'Generate Document',
        templateId: 'offer_letter',
        outputFileName: 'offer_{{ candidate_name }}.pdf',
        outputFormat: 'PDF',
        mergeFields: [{ key: 'candidate_name', value: '{{ webhook.candidate_name }}' }],
        outputVariable: 'generated_doc',
      };
  }
}
