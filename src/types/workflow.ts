import type { Edge, Node } from '@xyflow/react';

// ─── Node Data Types ───────────────────────────────────────────────────────

export type NodeType =
  | 'startNode'
  | 'taskNode'
  | 'approvalNode'
  | 'automatedStepNode'
  | 'splitNode'
  | 'delayNode'
  | 'endNode';

export interface KeyValuePair {
  key: string;
  value: string;
}

export interface StartNodeData {
  [key: string]: unknown;
  type: 'startNode';
  title: string;
  metadata: KeyValuePair[];
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

export type WorkflowNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedStepNodeData
  | SplitNodeData
  | DelayNodeData
  | EndNodeData;

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
