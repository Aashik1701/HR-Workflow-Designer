import { useState, useEffect, useCallback } from 'react';
import {
  fetchWorkflowById,
  fetchWorkflowVersions,
  publishWorkflowVersion,
  rollbackWorkflowToVersion,
  saveWorkflow,
} from '../api/workflows';
import { logActivity } from '../api/activity';
import { useWorkflowStore } from '../store/workflowStore';
import type { WorkflowRow, WorkflowVersionRow } from '../lib/database.types';
import type { WorkflowNode, WorkflowEdge } from '../types/workflow';
import toast from 'react-hot-toast';

export function useWorkflow(id: string) {
  const { setNodes, setEdges } = useWorkflowStore();
  const [workflow, setWorkflow] = useState<WorkflowRow | null>(null);
  const [versions, setVersions] = useState<WorkflowVersionRow[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [rollbackingVersionId, setRollbackingVersionId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  const loadVersions = useCallback(async () => {
    if (!id) return;
    setVersionsLoading(true);
    try {
      const history = await fetchWorkflowVersions(id);
      setVersions(history);
    } catch {
      toast.error('Failed to load release history');
    } finally {
      setVersionsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setLoadError(false);
    fetchWorkflowById(id)
      .then(wf => {
        if (!wf) { setLoadError(true); return; }
        setWorkflow(wf);
        setNodes(wf.nodes_data as WorkflowNode[]);
        setEdges(wf.edges_data as WorkflowEdge[]);
        void loadVersions();
      })
      .catch(() => setLoadError(true));
  }, [id, setNodes, setEdges, loadVersions]);

  const save = useCallback(async () => {
    const { nodes, edges } = useWorkflowStore.getState();
    setSaving(true);
    try {
      await saveWorkflow(id, nodes, edges);
      await logActivity('modified', `Saved workflow "${workflow?.name}"`, id, workflow?.name ?? undefined);
      setWorkflow(current => current ? { ...current, nodes_data: nodes, edges_data: edges } : current);
      toast.success('Workflow saved');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  }, [id, workflow]);

  const publish = useCallback(async (changeNote: string) => {
    const { nodes, edges } = useWorkflowStore.getState();
    if (!workflow) return;

    setPublishing(true);
    try {
      await saveWorkflow(id, nodes, edges);
      const publishedVersion = await publishWorkflowVersion(id, nodes, edges, changeNote || 'Published update');
      await logActivity(
        'deployed',
        `Published ${workflow.name} as v${publishedVersion.version_number}: ${publishedVersion.change_note || 'No changelog note'}`,
        id,
        workflow.name
      );
      setWorkflow(current => current ? { ...current, status: 'active', nodes_data: nodes, edges_data: edges } : current);
      await loadVersions();
      toast.success(`Published v${publishedVersion.version_number}`);
    } catch {
      toast.error('Publish failed. Ensure workflow_versions table exists.');
    } finally {
      setPublishing(false);
    }
  }, [id, workflow, loadVersions]);

  const rollbackToVersion = useCallback(async (version: WorkflowVersionRow) => {
    if (!workflow) return;

    setRollbackingVersionId(version.id);
    try {
      const rollbackSnapshot = await rollbackWorkflowToVersion(id, version.id);
      setNodes(version.nodes_data as WorkflowNode[]);
      setEdges(version.edges_data as WorkflowEdge[]);
      setWorkflow(current => current
        ? {
            ...current,
            status: 'active',
            nodes_data: version.nodes_data,
            edges_data: version.edges_data,
          }
        : current
      );
      await logActivity(
        'modified',
        `Rolled back ${workflow.name} to v${version.version_number} (new v${rollbackSnapshot.version_number})`,
        id,
        workflow.name
      );
      await loadVersions();
      toast.success(`Rolled back to v${version.version_number}`);
    } catch {
      toast.error('Rollback failed. Ensure workflow_versions table exists.');
    } finally {
      setRollbackingVersionId(null);
    }
  }, [id, workflow, setNodes, setEdges, loadVersions]);

  return {
    workflow,
    versions,
    versionsLoading,
    saving,
    publishing,
    rollbackingVersionId,
    save,
    publish,
    rollbackToVersion,
    loadError,
  };
}
