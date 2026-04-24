import { useState, useEffect } from 'react';
import { getAutomations } from '../api/workflowApi';
import type { AutomationAction } from '../types/workflow';

export function useAutomations() {
  const [automations, setAutomations] = useState<AutomationAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAutomations()
      .then(setAutomations)
      .finally(() => setLoading(false));
  }, []);

  return { automations, loading };
}
