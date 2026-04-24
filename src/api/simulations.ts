import { supabase } from '../lib/supabase';
import type { SimulationLogRow } from '../lib/database.types';

export async function saveSimulationLog(
  workflowId: string,
  result: { success: boolean; steps: unknown[]; errors: string[]; duration_ms: number }
): Promise<void> {
  const { error } = await supabase
    .from('simulation_logs')
    .insert({ workflow_id: workflowId, ...result });
  if (error) throw error;
}

export async function fetchSimulationLogs(workflowId?: string): Promise<SimulationLogRow[]> {
  let query = supabase
    .from('simulation_logs')
    .select('*, workflows(name)')
    .order('created_at', { ascending: false });

  if (workflowId) {
    query = query.eq('workflow_id', workflowId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as SimulationLogRow[];
}

export async function fetchAllSimulationLogs(): Promise<SimulationLogRow[]> {
  const { data, error } = await supabase
    .from('simulation_logs')
    .select('*, workflows(name)')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as SimulationLogRow[];
}
