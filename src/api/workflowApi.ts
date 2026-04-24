import type { AutomationAction, SimulationResult } from '../types/workflow';

export async function getAutomations(): Promise<AutomationAction[]> {
  const res = await fetch('/api/automations');
  if (!res.ok) throw new Error('Failed to fetch automations');
  return res.json();
}

export async function simulateWorkflow(
  nodes: unknown[],
  edges: unknown[]
): Promise<SimulationResult> {
  const res = await fetch('/api/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodes, edges }),
  });
  if (!res.ok) throw new Error('Simulation failed');
  return res.json();
}
