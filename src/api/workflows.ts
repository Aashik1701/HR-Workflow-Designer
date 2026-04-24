import { supabase } from '../lib/supabase';
import type { WorkflowRow, WorkflowStatus } from '../lib/database.types';

export async function fetchWorkflows(): Promise<WorkflowRow[]> {
  const { data, error } = await supabase
    .from('workflows')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchWorkflowById(id: string): Promise<WorkflowRow | null> {
  const { data, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createWorkflow(name: string, description = ''): Promise<WorkflowRow> {
  const { data, error } = await supabase
    .from('workflows')
    .insert({ name, description, status: 'draft', nodes_data: [], edges_data: [] })
    .select()
    .single();
  if (error) throw error;
  return data!;
}

export async function saveWorkflow(
  id: string,
  nodes: unknown[],
  edges: unknown[]
): Promise<void> {
  const { error } = await supabase
    .from('workflows')
    .update({ nodes_data: nodes, edges_data: edges })
    .eq('id', id);
  if (error) throw error;
}

export async function updateWorkflowStatus(id: string, status: WorkflowStatus): Promise<void> {
  const { error } = await supabase
    .from('workflows')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteWorkflow(id: string): Promise<void> {
  const { error } = await supabase
    .from('workflows')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function fetchDashboardStats() {
  const { data, error } = await supabase
    .from('workflows')
    .select('status');
  if (error) throw error;

  const total = data.length;
  const active = data.filter(w => w.status === 'active').length;
  const draft = data.filter(w => w.status === 'draft').length;

  const { count: failedRuns } = await supabase
    .from('simulation_logs')
    .select('*', { count: 'exact', head: true })
    .eq('success', false);

  return { total, active, draft, failedRuns: failedRuns ?? 0 };
}
