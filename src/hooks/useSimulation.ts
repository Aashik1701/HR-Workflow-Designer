import { useState, useCallback } from 'react';
import { simulateWorkflow } from '../api/workflowApi';
import { saveSimulationLog } from '../api/simulations';
import { logActivity } from '../api/activity';
import { validateWorkflow } from '../utils/graphValidator';
import type { SimulationResult } from '../types/workflow';
import { useWorkflowStore } from '../store/workflowStore';

export function useSimulation(workflowId?: string) {
  const { nodes, edges } = useWorkflowStore();
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setError(null);
    setResult(null);

    // Local validation first
    const validation = validateWorkflow(nodes, edges);
    if (!validation.isValid) {
      setError(validation.errors.map(e => e.message).join('\n'));
      return;
    }

    setLoading(true);
    const startTime = Date.now();
    try {
      const res = await simulateWorkflow(nodes, edges);
      const duration_ms = Date.now() - startTime;
      setResult(res);

      // Persist to Supabase if we have a workflow ID
      if (workflowId) {
        await saveSimulationLog(workflowId, {
          success: res.success,
          steps: res.executedSteps,
          errors: res.errors,
          duration_ms,
        });
        await logActivity(
          'modified',
          `Simulation run (${res.totalSteps} steps, ${res.success ? 'passed' : 'failed'})`,
          workflowId
        );
      }
    } catch {
      setError('Simulation request failed. Check console.');
    } finally {
      setLoading(false);
    }
  }, [nodes, edges, workflowId]);

  return { run, result, loading, error };
}

