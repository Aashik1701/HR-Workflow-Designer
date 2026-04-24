import { useState, useCallback } from 'react';
import { simulateWorkflow } from '../api/workflowApi';
import { validateWorkflow } from '../utils/graphValidator';
import type { SimulationResult } from '../types/workflow';
import { useWorkflowStore } from '../store/workflowStore';

export function useSimulation() {
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
    try {
      const res = await simulateWorkflow(nodes, edges);
      setResult(res);
    } catch {
      setError('Simulation request failed. Check console.');
    } finally {
      setLoading(false);
    }
  }, [nodes, edges]);

  return { run, result, loading, error };
}
