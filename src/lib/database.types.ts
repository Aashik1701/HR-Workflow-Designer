// Minimal database types — the Supabase client is created without generics
// to avoid complex recursive type issues while the real types file stays as reference.
export type WorkflowStatus = 'draft' | 'active' | 'archived';
export type ActivityActionType = 'created' | 'modified' | 'deployed' | 'approved' | 'warning';

export interface WorkflowRow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  nodes_data: unknown[];
  edges_data: unknown[];
  node_count: number;
  created_at: string;
  updated_at: string;
}

export interface WorkflowVersionRow {
  id: string;
  workflow_id: string;
  version_number: number;
  change_note: string;
  nodes_data: unknown[];
  edges_data: unknown[];
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

export interface AutomationRow {
  id: string;
  label: string;
  description: string;
  params: string[];
  category: string;
  icon: string;
  is_active: boolean;
  created_at: string;
}

export interface SimulationLogRow {
  id: string;
  workflow_id: string;
  success: boolean;
  steps: unknown[];
  errors: string[];
  duration_ms: number;
  created_at: string;
  workflows?: { name: string } | null;
}

export interface ActivityLogRow {
  id: string;
  action_type: ActivityActionType;
  workflow_id: string | null;
  workflow_name: string | null;
  user_name: string;
  description: string;
  created_at: string;
}
