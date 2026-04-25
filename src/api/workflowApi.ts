import type {
  AutomatedStepNodeData,
  NodeType,
  ReliabilityPolicy,
  SimulationResult,
  SimulationStep,
  StartNodeData,
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
  const simulatedAt = Date.now();
  const errors: string[] = [];
  const steps: SimulationStep[] = [];

  executionOrder.forEach((node, index) => {
    const nodeType = (node.type ?? (node.data as { type?: string }).type) as NodeType;
    if (nodeType === 'startNode') {
      const startData = node.data as StartNodeData;
      const triggerValidationError = validateStartTrigger(startData);
      if (triggerValidationError) {
        errors.push(`[${getNodeTitle(node)}] ${triggerValidationError}`);
        steps.push({
          nodeId: node.id,
          nodeType,
          nodeTitle: getNodeTitle(node),
          status: 'error',
          message: `Trigger configuration invalid: ${triggerValidationError}`,
          timestamp: new Date(simulatedAt + index * 500).toISOString(),
          durationMs: 0,
        });
        return;
      }

      steps.push({
        nodeId: node.id,
        nodeType,
        nodeTitle: getNodeTitle(node),
        status: 'success',
        message: `Triggered by ${describeTrigger(startData)}`,
        timestamp: new Date(simulatedAt + index * 500).toISOString(),
        durationMs: 80,
      });
      return;
    }

    if (nodeType === 'automatedStepNode') {
      const autoData = node.data as AutomatedStepNodeData;
      const reliability = withDefaultReliability(autoData.reliability);
      const attemptResult = simulateAutomatedStep(reliability);
      const failureBranchTarget =
        attemptResult.success || reliability.onFailure.mode !== 'branch'
          ? undefined
          : reliability.onFailure.branchTargetNodeId;
      const deadLettered =
        !attemptResult.success &&
        (reliability.deadLetterQueue.enabled || reliability.onFailure.mode === 'deadLetterQueue');

      if (!attemptResult.success) {
        errors.push(
          `[${getNodeTitle(node)}] Failed after ${attemptResult.attempts} attempt(s): ${attemptResult.reason}`
        );
      }

      steps.push({
        nodeId: node.id,
        nodeType,
        nodeTitle: getNodeTitle(node),
        status: attemptResult.success ? 'success' : 'error',
        message: buildAutomatedMessage(attemptResult, reliability, deadLettered, failureBranchTarget),
        timestamp: new Date(simulatedAt + index * 500).toISOString(),
        durationMs: attemptResult.durationMs,
        attempts: attemptResult.attempts,
        retried: attemptResult.attempts > 1,
        deadLettered,
        failureBranchTarget,
      });
      return;
    }

    steps.push({
      nodeId: node.id,
      nodeType,
      nodeTitle: getNodeTitle(node),
      status: 'success',
      message: getStepMessage(nodeType),
      timestamp: new Date(simulatedAt + index * 500).toISOString(),
      durationMs: Math.floor(Math.random() * 400) + 100,
    });
  });

  return {
    success: errors.length === 0,
    totalSteps: steps.length,
    executedSteps: steps,
    errors,
    completedAt: new Date().toISOString(),
  };
}

function validateStartTrigger(startData: StartNodeData): string | null {
  const triggerType = startData.triggerType ?? 'manual';
  const config = startData.triggerConfig ?? {};

  if (triggerType === 'schedule' && !config.cron?.trim()) {
    return 'Schedule trigger requires a cron expression.';
  }
  if (triggerType === 'webhook' && !config.webhookPath?.trim()) {
    return 'Webhook trigger requires a webhook path.';
  }
  if (triggerType === 'event' && !config.eventName?.trim()) {
    return 'Event trigger requires an event name.';
  }

  return null;
}

function describeTrigger(startData: StartNodeData): string {
  const triggerType = startData.triggerType ?? 'manual';
  const config = startData.triggerConfig ?? {};

  if (triggerType === 'schedule') return `schedule (${config.cron})`;
  if (triggerType === 'webhook') return `webhook (${config.webhookPath})`;
  if (triggerType === 'event') {
    const source = config.source?.trim() ? ` from ${config.source}` : '';
    return `event ${config.eventName}${source}`;
  }

  return 'manual trigger';
}

function withDefaultReliability(policy: ReliabilityPolicy | undefined): ReliabilityPolicy {
  return {
    retryPolicy: {
      maxRetries: policy?.retryPolicy?.maxRetries ?? 2,
      backoffMs: policy?.retryPolicy?.backoffMs ?? 500,
      strategy: policy?.retryPolicy?.strategy ?? 'fixed',
    },
    timeoutMs: policy?.timeoutMs ?? 5000,
    deadLetterQueue: {
      enabled: policy?.deadLetterQueue?.enabled ?? false,
      queueName: policy?.deadLetterQueue?.queueName ?? 'automation_dead_letter',
    },
    onFailure: {
      mode: policy?.onFailure?.mode ?? 'continue',
      branchTargetNodeId: policy?.onFailure?.branchTargetNodeId,
    },
  };
}

function simulateAutomatedStep(policy: ReliabilityPolicy): {
  success: boolean;
  attempts: number;
  reason: string;
  durationMs: number;
} {
  let attempts = 0;
  let totalDuration = 0;
  let reason = 'transient failure';

  while (attempts <= policy.retryPolicy.maxRetries) {
    attempts += 1;
    const runtime = Math.floor(Math.random() * 1000) + 150;
    const timedOut = runtime > policy.timeoutMs;
    // Lowered from 25% to 5% to ensure demo workflows rarely fail randomly
    const transientFailure = !timedOut && Math.random() < 0.05;
    totalDuration += Math.min(runtime, policy.timeoutMs);

    if (!timedOut && !transientFailure) {
      return { success: true, attempts, reason: 'none', durationMs: totalDuration };
    }

    reason = timedOut ? 'timeout exceeded' : 'transient failure';

    if (attempts <= policy.retryPolicy.maxRetries) {
      const factor = policy.retryPolicy.strategy === 'exponential' ? 2 ** (attempts - 1) : 1;
      totalDuration += policy.retryPolicy.backoffMs * factor;
    }
  }

  return {
    success: false,
    attempts,
    reason,
    durationMs: totalDuration,
  };
}

function buildAutomatedMessage(
  attemptResult: { success: boolean; attempts: number; reason: string },
  policy: ReliabilityPolicy,
  deadLettered: boolean,
  failureBranchTarget?: string
): string {
  if (attemptResult.success) {
    return attemptResult.attempts > 1
      ? `Succeeded after ${attemptResult.attempts} attempt(s).`
      : 'Automated action executed on first attempt.';
  }

  const parts = [
    `Failed after ${attemptResult.attempts} attempt(s): ${attemptResult.reason}.`,
    `Failure mode: ${policy.onFailure.mode}.`,
  ];

  if (failureBranchTarget) {
    parts.push(`Routed to failure branch target ${failureBranchTarget}.`);
  }

  if (deadLettered) {
    parts.push(`Dead-lettered to ${policy.deadLetterQueue.queueName}.`);
  }

  return parts.join(' ');
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
