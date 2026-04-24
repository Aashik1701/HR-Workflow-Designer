import { useState, useEffect, useCallback } from 'react';
import { fetchWorkflows, deleteWorkflow, updateWorkflowStatus } from '../api/workflows';
import { logActivity } from '../api/activity';
import type { WorkflowRow } from '../lib/database.types';
import toast from 'react-hot-toast';

export function useWorkflows() {
  const [workflows, setWorkflows] = useState<WorkflowRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setWorkflows(await fetchWorkflows());
    } catch {
      toast.error('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (id: string, name: string) => {
    try {
      await deleteWorkflow(id);
      await logActivity('modified', `Deleted workflow "${name}"`);
      toast.success(`"${name}" deleted`);
      load();
    } catch {
      toast.error('Failed to delete workflow');
    }
  };

  const activate = async (id: string, name: string) => {
    try {
      await updateWorkflowStatus(id, 'active');
      await logActivity('deployed', `Workflow "${name}" set to active`, id, name);
      toast.success(`"${name}" is now Active`);
      load();
    } catch {
      toast.error('Failed to update status');
    }
  };

  return { workflows, loading, reload: load, remove, activate };
}
