import type { Edge, Node } from '@xyflow/react';

// ─── Node Data Types ───────────────────────────────────────────────────────

export type NodeType =
  | 'startNode'
  | 'taskNode'
  | 'approvalNode'
  | 'automatedStepNode'
  | 'splitNode'
  | 'delayNode'
  | 'endNode'
  | 'webhookNode'
  | 'aiActionNode'
  | 'forkNode'
  | 'loopNode'
  | 'documentGenNode';

export interface KeyValuePair {
  key: string;
  value: string;
}

export interface StartNodeData {
  [key: string]: unknown;
  type: 'startNode';
  title: string;
  metadata: KeyValuePair[];
  triggerType?: TriggerType;
  triggerConfig?: TriggerConfig;
  hasError?: boolean;
  errorMessage?: string;
}

export interface TaskNodeData {
  [key: string]: unknown;
  type: 'taskNode';
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  customFields: KeyValuePair[];
  hasError?: boolean;
  errorMessage?: string;
}

export interface ApprovalNodeData {
  [key: string]: unknown;
  type: 'approvalNode';
  title: string;
  approverRole: 'Manager' | 'HRBP' | 'Director';
  autoApproveThreshold: number;
  hasError?: boolean;
  errorMessage?: string;
}

export interface AutomationAction {
  id: string;
  label: string;
  params: string[];
}

export interface AutomatedStepNodeData {
  [key: string]: unknown;
  type: 'automatedStepNode';
  title: string;
  actionId: string;
  actionParams: Record<string, string>;
  reliability?: ReliabilityPolicy;
  hasError?: boolean;
  errorMessage?: string;
}

export interface SplitNodeData {
  [key: string]: unknown;
  type: 'splitNode';
  title: string;
  pathALabel: string;
  pathBLabel: string;
  splitPercentage: number;
  hasError?: boolean;
  errorMessage?: string;
}

export interface DelayNodeData {
  [key: string]: unknown;
  type: 'delayNode';
  title: string;
  duration: number;
  unit: 'minutes' | 'hours' | 'days';
  hasError?: boolean;
  errorMessage?: string;
}

export interface EndNodeData {
  [key: string]: unknown;
  type: 'endNode';
  endMessage: string;
  summaryFlag: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

// ─── New Node Data Types ─────────────────────────────────────────────────

export interface WebhookNodeData {
  [key: string]: unknown;
  type: 'webhookNode';
  title: string;
  webhookUrl: string;
  httpMethod: 'GET' | 'POST' | 'PUT';
  payloadSchema: KeyValuePair[];
  authType: 'none' | 'bearer' | 'apiKey';
  authToken: string;
  hasError?: boolean;
  errorMessage?: string;
}

export interface AIActionNodeData {
  [key: string]: unknown;
  type: 'aiActionNode';
  title: string;
  model: 'gpt-4o' | 'gpt-4o-mini' | 'claude-sonnet' | 'gemini-pro';
  prompt: string;
  inputVariables: string[];
  outputVariable: string;
  temperature: number;
  hasError?: boolean;
  errorMessage?: string;
}

export interface ForkNodeData {
  [key: string]: unknown;
  type: 'forkNode';
  title: string;
  mode: 'fork' | 'join';
  branches: number;
  branchLabels: string[];
  hasError?: boolean;
  errorMessage?: string;
}

export interface LoopNodeData {
  [key: string]: unknown;
  type: 'loopNode';
  title: string;
  iteratorSource: string;
  maxIterations: number;
  currentItemVariable: string;
  hasError?: boolean;
  errorMessage?: string;
}

export interface DocumentGenNodeData {
  [key: string]: unknown;
  type: 'documentGenNode';
  title: string;
  templateId: string;
  customTemplateUrl?: string;
  outputFileName: string;
  outputFormat: 'PDF' | 'DOCX' | 'HTML';
  mergeFields: KeyValuePair[];
  outputVariable: string;
  hasError?: boolean;
  errorMessage?: string;
}

export type WorkflowNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedStepNodeData
  | SplitNodeData
  | DelayNodeData
  | EndNodeData
  | WebhookNodeData
  | AIActionNodeData
  | ForkNodeData
  | LoopNodeData
  | DocumentGenNodeData;

export type WorkflowNode = Node<WorkflowNodeData, NodeType>;
export type WorkflowEdge = Edge;

export interface WorkflowPayload {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

// ─── Simulation Types ──────────────────────────────────────────────────────

export type SimulationStepStatus = 'pending' | 'running' | 'success' | 'error' | 'skipped';

export interface SimulationStep {
  nodeId: string;
  nodeType: NodeType;
  nodeTitle: string;
  status: SimulationStepStatus;
  message: string;
  timestamp: string;
  durationMs: number;
  attempts?: number;
  retried?: boolean;
  deadLettered?: boolean;
  failureBranchTarget?: string;
}

export interface SimulationResult {
  success: boolean;
  totalSteps: number;
  executedSteps: SimulationStep[];
  errors: string[];
  completedAt: string;
}

// ─── Validation Types ──────────────────────────────────────────────────────

export interface ValidationError {
  nodeId: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ─── Reliability / Trigger Types ───────────────────────────────────────────

export type RetryStrategy = 'fixed' | 'exponential';
export type FailureMode = 'continue' | 'branch' | 'deadLetterQueue';
export type TriggerType = 'manual' | 'schedule' | 'webhook' | 'event';

export interface RetryPolicy {
  maxRetries: number;
  backoffMs: number;
  strategy: RetryStrategy;
}

export interface DeadLetterQueueConfig {
  enabled: boolean;
  queueName: string;
}

export interface OnFailureConfig {
  mode: FailureMode;
  branchTargetNodeId?: string;
}

export interface ReliabilityPolicy {
  retryPolicy: RetryPolicy;
  timeoutMs: number;
  deadLetterQueue: DeadLetterQueueConfig;
  onFailure: OnFailureConfig;
}

export interface TriggerConfig {
  cron?: string;
  webhookPath?: string;
  eventName?: string;
  source?: string;
}
