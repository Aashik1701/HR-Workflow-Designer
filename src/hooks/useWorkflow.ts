import { useState, useEffect, useCallback } from 'react';
import { fetchWorkflowById, saveWorkflow } from '../api/workflows';
import { logActivity } from '../api/activity';
import { useWorkflowStore } from '../store/workflowStore';
import type { WorkflowRow } from '../lib/database.types';
import type { WorkflowNode, WorkflowEdge } from '../types/workflow';
import toast from 'react-hot-toast';

export function useWorkflow(id: string) {
  const { setNodes, setEdges } = useWorkflowStore();
  const [workflow, setWorkflow] = useState<WorkflowRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchWorkflowById(id)
      .then(wf => {
        if (!wf) { setLoadError(true); return; }
        setWorkflow(wf);
        setNodes(wf.nodes_data as WorkflowNode[]);
        setEdges(wf.edges_data as WorkflowEdge[]);
      })
      .catch(() => setLoadError(true));
  }, [id, setNodes, setEdges]);

  const save = useCallback(async () => {
    const { nodes, edges } = useWorkflowStore.getState();
    setSaving(true);
    try {
      await saveWorkflow(id, nodes, edges);
      await logActivity('modified', `Saved workflow "${workflow?.name}"`, id, workflow?.name ?? undefined);
      toast.success('Workflow saved');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  }, [id, workflow]);

  return { workflow, saving, save, loadError };
}
