// ─── Node Data Types ───────────────────────────────────────────────────────

export type NodeType =
  | 'startNode'
  | 'taskNode'
  | 'approvalNode'
  | 'automatedStepNode'
  | 'endNode';

export interface KeyValuePair {
  key: string;
  value: string;
}

export interface StartNodeData {
  type: 'startNode';
  title: string;
  metadata: KeyValuePair[];
  hasError?: boolean;
  errorMessage?: string;
}

export interface TaskNodeData {
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
  type: 'automatedStepNode';
  title: string;
  actionId: string;
  actionParams: Record<string, string>;
  hasError?: boolean;
  errorMessage?: string;
}

export interface EndNodeData {
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
  | EndNodeData;

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
