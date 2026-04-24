import { supabase } from '../lib/supabase';
import type { AutomationRow } from '../lib/database.types';

export async function fetchAutomations(): Promise<AutomationRow[]> {
  const { data, error } = await supabase
    .from('automations')
    .select('*')
    .eq('is_active', true)
    .order('category');
  if (error) throw error;
  return data ?? [];
}
