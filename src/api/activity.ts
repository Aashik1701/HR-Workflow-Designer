import { supabase } from '../lib/supabase';
import type { ActivityLogRow, ActivityActionType } from '../lib/database.types';

export async function fetchRecentActivity(limit = 10): Promise<ActivityLogRow[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function logActivity(
  action_type: ActivityActionType,
  description: string,
  workflow_id?: string,
  workflow_name?: string
): Promise<void> {
  await supabase.from('activity_logs').insert({
    action_type,
    description,
    workflow_id: workflow_id ?? null,
    workflow_name: workflow_name ?? null,
    user_name: 'Aashik',
  });
}
