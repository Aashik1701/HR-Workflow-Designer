import { useState, useEffect } from 'react';
import { fetchDashboardStats, fetchWorkflows } from '../api/workflows';
import { fetchRecentActivity } from '../api/activity';
import type { WorkflowRow, ActivityLogRow } from '../lib/database.types';

interface DashboardStats {
  total: number;
  active: number;
  draft: number;
  failedRuns: number;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({ total: 0, active: 0, draft: 0, failedRuns: 0 });
  const [recentWorkflows, setRecentWorkflows] = useState<WorkflowRow[]>([]);
  const [activity, setActivity] = useState<ActivityLogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchDashboardStats(),
      fetchWorkflows().then(d => d.slice(0, 5)),
      fetchRecentActivity(8),
    ])
      .then(([s, wf, act]) => {
        setStats(s);
        setRecentWorkflows(wf);
        setActivity(act);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { stats, recentWorkflows, activity, loading };
}
