import { supabase } from '../lib/supabase';
import type { WorkflowRow, WorkflowStatus, WorkflowVersionRow } from '../lib/database.types';

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

async function getNextWorkflowVersionNumber(workflowId: string): Promise<number> {
  const { data, error } = await supabase
    .from('workflow_versions')
    .select('version_number')
    .eq('workflow_id', workflowId)
    .order('version_number', { ascending: false })
    .limit(1);

  if (error) throw error;
  return (data?.[0]?.version_number ?? 0) + 1;
}

export async function fetchWorkflowVersions(workflowId: string): Promise<WorkflowVersionRow[]> {
  const { data, error } = await supabase
    .from('workflow_versions')
    .select('*')
    .eq('workflow_id', workflowId)
    .order('version_number', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function publishWorkflowVersion(
  workflowId: string,
  nodes: unknown[],
  edges: unknown[],
  changeNote: string
): Promise<WorkflowVersionRow> {
  const versionNumber = await getNextWorkflowVersionNumber(workflowId);

  const { data, error } = await supabase
    .from('workflow_versions')
    .insert({
      workflow_id: workflowId,
      version_number: versionNumber,
      change_note: changeNote.trim(),
      nodes_data: nodes,
      edges_data: edges,
      is_published: true,
      published_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  const { error: workflowUpdateError } = await supabase
    .from('workflows')
    .update({ status: 'active', nodes_data: nodes, edges_data: edges })
    .eq('id', workflowId);

  if (workflowUpdateError) throw workflowUpdateError;
  return data;
}

export async function rollbackWorkflowToVersion(
  workflowId: string,
  targetVersionId: string,
  rollbackNote?: string
): Promise<WorkflowVersionRow> {
  const { data: targetVersion, error: targetVersionError } = await supabase
    .from('workflow_versions')
    .select('*')
    .eq('id', targetVersionId)
    .eq('workflow_id', workflowId)
    .single();

  if (targetVersionError) throw targetVersionError;

  const { error: workflowUpdateError } = await supabase
    .from('workflows')
    .update({
      status: 'active',
      nodes_data: targetVersion.nodes_data,
      edges_data: targetVersion.edges_data,
    })
    .eq('id', workflowId);

  if (workflowUpdateError) throw workflowUpdateError;

  const versionNumber = await getNextWorkflowVersionNumber(workflowId);
  const note = rollbackNote?.trim() || `Rollback to v${targetVersion.version_number}`;

  const { data: rollbackSnapshot, error: rollbackSnapshotError } = await supabase
    .from('workflow_versions')
    .insert({
      workflow_id: workflowId,
      version_number: versionNumber,
      change_note: note,
      nodes_data: targetVersion.nodes_data,
      edges_data: targetVersion.edges_data,
      is_published: true,
      published_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (rollbackSnapshotError) throw rollbackSnapshotError;
  return rollbackSnapshot;
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
