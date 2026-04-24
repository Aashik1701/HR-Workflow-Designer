import { useState, useEffect } from 'react';
import { fetchAutomations } from '../api/automations';
import type { AutomationRow } from '../lib/database.types';

export function useAutomations() {
  const [automations, setAutomations] = useState<AutomationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAutomations()
      .then(setAutomations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { automations, loading };
}

