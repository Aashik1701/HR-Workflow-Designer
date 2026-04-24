import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchAllSimulationLogs } from '../api/simulations';
import type { SimulationLogRow } from '../lib/database.types';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Filter,
  Flame,
  History,
  Layers3,
  RefreshCw,
  Search,
  Sparkles,
  TimerReset,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import clsx from 'clsx';

type SortMode = 'newest' | 'oldest' | 'slowest' | 'fastest';
type StatusFilter = 'all' | 'passed' | 'failed';

type SimulationStepRecord = {
  nodeId?: string;
  nodeType?: string;
  nodeTitle?: string;
  status?: string;
  message?: string;
  timestamp?: string;
  durationMs?: number;
};

function isSimulationStepRecord(value: unknown): value is SimulationStepRecord {
  return typeof value === 'object' && value !== null;
}

function formatDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function getDurationBand(ms: number) {
  if (ms < 1000) return 'Lightning fast';
  if (ms < 2500) return 'Healthy';
  if (ms < 5000) return 'Needs attention';
  return 'Slow path';
}

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accent: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-xl shadow-black/10 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/[0.05]">
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-10`} />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">{label}</p>
          <p className="mt-2 text-3xl font-extrabold text-white tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-white/45">{helper}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-white/80">
          <Icon size={16} />
        </div>
      </div>
    </div>
  );
}

export function Logs() {
  const [logs, setLogs] = useState<SimulationLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllSimulationLogs();
      setLogs(data);
      if (!selectedLogId && data.length > 0) {
        setSelectedLogId(data[0].id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [selectedLogId]);

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      setLoading(true);
      try {
        const data = await fetchAllSimulationLogs();
        if (!active) return;
        setLogs(data);
        setSelectedLogId((current) => current ?? data[0]?.id ?? null);
      } catch (error) {
        if (active) {
          console.error(error);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void initialize();
    return () => {
      active = false;
    };
  }, []);

  const enrichedLogs = useMemo(() => {
    const normalized = logs.map((log) => ({
      ...log,
      workflowName: log.workflows?.name ?? 'Unknown workflow',
      stepCount: Array.isArray(log.steps) ? log.steps.length : 0,
      failedStepCount: log.errors.length,
    }));

    const filtered = normalized.filter((log) => {
      const statusMatch =
        statusFilter === 'all'
          ? true
          : statusFilter === 'passed'
            ? log.success
            : !log.success;
      const queryMatch =
        query.trim().length === 0 ||
        log.workflowName.toLowerCase().includes(query.toLowerCase().trim()) ||
        log.id.toLowerCase().includes(query.toLowerCase().trim());
      return statusMatch && queryMatch;
    });

    const sorted = [...filtered].sort((a, b) => {
      switch (sortMode) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'slowest':
          return b.duration_ms - a.duration_ms;
        case 'fastest':
          return a.duration_ms - b.duration_ms;
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return sorted;
  }, [logs, query, sortMode, statusFilter]);

  const selectedLog = useMemo(
    () => enrichedLogs.find((log) => log.id === selectedLogId) ?? enrichedLogs[0] ?? null,
    [enrichedLogs, selectedLogId]
  );

  const totals = useMemo(() => {
    const total = logs.length;
    const passed = logs.filter((log) => log.success).length;
    const failed = total - passed;
    const avgDuration = total > 0 ? Math.round(logs.reduce((sum, log) => sum + log.duration_ms, 0) / total) : 0;
    const avgSteps = total > 0 ? (logs.reduce((sum, log) => sum + (Array.isArray(log.steps) ? log.steps.length : 0), 0) / total).toFixed(1) : '0.0';
    const successRate = total > 0 ? Math.round((passed / total) * 100) : 0;

    return { total, passed, failed, avgDuration, avgSteps, successRate };
  }, [logs]);

  const topWorkflow = useMemo(() => {
    const counts = new Map<string, { runs: number; failures: number }>();
    logs.forEach((log) => {
      const name = log.workflows?.name ?? 'Unknown workflow';
      const current = counts.get(name) ?? { runs: 0, failures: 0 };
      current.runs += 1;
      if (!log.success) current.failures += 1;
      counts.set(name, current);
    });

    return [...counts.entries()]
      .sort((a, b) => b[1].runs - a[1].runs)
      .slice(0, 3)
      .map(([name, data]) => ({ name, ...data }));
  }, [logs]);

  const recentFailure = useMemo(
    () => logs.find((log) => !log.success) ?? null,
    [logs]
  );

  const stepBreakdown = useMemo(() => {
    const selectedSteps = Array.isArray(selectedLog?.steps) ? selectedLog.steps : [];
    return selectedSteps.filter(isSimulationStepRecord).map((step, index) => ({
      index,
      title: step.nodeTitle ?? step.nodeId ?? `Step ${index + 1}`,
      type: step.nodeType ?? 'unknown',
      status: step.status ?? 'success',
      message: step.message ?? 'Executed',
      durationMs: step.durationMs ?? 0,
      timestamp: step.timestamp,
    }));
  }, [selectedLog]);

  return (
    <div className="relative min-h-full overflow-hidden bg-[#090913] text-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-violet-600/15 blur-3xl" />
        <div className="absolute left-1/4 top-40 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl space-y-6 p-5 md:p-6">
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/20 backdrop-blur-sm md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-200">
                <Sparkles size={12} /> Simulation Intelligence
              </div>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-white md:text-4xl">
                Simulation Logs
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/45 md:text-[15px]">
                Track run outcomes, inspect step timing, and surface failure patterns across workflows with a more analytical view.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={load}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-colors hover:bg-violet-500">
                <ArrowUpRight size={14} />
                Export Insights
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Total Runs"
              value={totals.total.toString()}
              helper="All simulation executions"
              icon={History}
              accent="from-violet-500 to-cyan-500"
            />
            <MetricCard
              label="Success Rate"
              value={`${totals.successRate}%`}
              helper={`${totals.passed} passed / ${totals.failed} failed`}
              icon={TrendingUp}
              accent="from-emerald-500 to-cyan-500"
            />
            <MetricCard
              label="Avg Duration"
              value={totals.avgDuration ? formatDuration(totals.avgDuration) : '0ms'}
              helper={`Typical run falls in ${getDurationBand(totals.avgDuration)}`}
              icon={TimerReset}
              accent="from-amber-500 to-fuchsia-500"
            />
            <MetricCard
              label="Avg Steps"
              value={totals.avgSteps}
              helper="Mean nodes executed per run"
              icon={Layers3}
              accent="from-sky-500 to-violet-500"
            />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 shadow-xl shadow-black/10 backdrop-blur-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={15} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search workflow name or run id"
                    className="w-full rounded-2xl border border-white/10 bg-[#0d0d18] py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-violet-500/40"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    <Filter size={12} /> Filters
                  </span>
                  {(['all', 'passed', 'failed'] as const).map((option) => (
                    <button
                      key={option}
                      onClick={() => setStatusFilter(option)}
                      className={clsx(
                        'rounded-full border px-3 py-2 text-xs font-medium capitalize transition-colors',
                        statusFilter === option
                          ? 'border-violet-500/30 bg-violet-500/15 text-violet-200'
                          : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      {option}
                    </button>
                  ))}
                  <select
                    value={sortMode}
                    onChange={(event) => setSortMode(event.target.value as SortMode)}
                    className="rounded-full border border-white/10 bg-[#0d0d18] px-3 py-2 text-xs text-white/70 outline-none"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="slowest">Slowest runs</option>
                    <option value="fastest">Fastest runs</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-xl shadow-black/10 backdrop-blur-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-white">Top workflows</h2>
                    <p className="text-xs text-white/35">Most executed simulation targets</p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/40">
                    Top 3
                  </div>
                </div>
                <div className="space-y-3">
                  {topWorkflow.length === 0 ? (
                    <p className="text-sm text-white/35">No workflow trends yet.</p>
                  ) : (
                    topWorkflow.map((workflow, index) => (
                      <div key={workflow.name} className="rounded-2xl border border-white/10 bg-[#0d0d18] p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium text-white">{workflow.name}</p>
                            <p className="mt-1 text-xs text-white/40">
                              {workflow.runs} run{workflow.runs > 1 ? 's' : ''} · {workflow.failures} failure{workflow.failures !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/60">
                            #{index + 1}
                          </div>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                            style={{ width: `${Math.max(18, (workflow.runs / Math.max(1, logs.length)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-xl shadow-black/10 backdrop-blur-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-white">Insight pulse</h2>
                    <p className="text-xs text-white/35">Operational signals from your simulation history</p>
                  </div>
                  <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-emerald-200">
                    Live
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-[#0d0d18] p-4">
                    <div className="flex items-center gap-2 text-emerald-300">
                      <CheckCircle2 size={14} />
                      <span className="text-xs font-semibold uppercase tracking-[0.18em]">Performance</span>
                    </div>
                    <p className="mt-2 text-sm text-white/80">
                      {totals.successRate >= 80
                        ? 'Simulation health is strong. Most workflows are executing without interruption.'
                        : 'Some runs need attention. Review failures and long-running workflows first.'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-[#0d0d18] p-4">
                    <div className="flex items-center gap-2 text-amber-300">
                      <AlertTriangle size={14} />
                      <span className="text-xs font-semibold uppercase tracking-[0.18em]">Watchlist</span>
                    </div>
                    <p className="mt-2 text-sm text-white/80">
                      {recentFailure
                        ? `Latest failure from ${recentFailure.workflows?.name ?? 'an unknown workflow'} ${formatDistanceToNow(new Date(recentFailure.created_at), { addSuffix: true })}.`
                        : 'No failures recorded in the current window.'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-[#0d0d18] p-4">
                    <div className="flex items-center gap-2 text-cyan-300">
                      <Flame size={14} />
                      <span className="text-xs font-semibold uppercase tracking-[0.18em]">Throughput</span>
                    </div>
                    <p className="mt-2 text-sm text-white/80">
                      Average runtime is {totals.avgDuration ? formatDuration(totals.avgDuration) : '0ms'}, which is {getDurationBand(totals.avgDuration).toLowerCase()} for the current simulation set.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/20 backdrop-blur-sm">
              <div className="border-b border-white/10 px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-semibold text-white">Simulation feed</h2>
                    <p className="text-xs text-white/35">Browse runs, inspect durations, and jump into step details</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-white/30">
                    {enrichedLogs.length} result{enrichedLogs.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="px-5 py-14 text-center">
                  <div className="mx-auto flex max-w-xs flex-col items-center gap-3 text-white/35">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
                    <p className="text-sm">Loading simulation logs...</p>
                  </div>
                </div>
              ) : enrichedLogs.length === 0 ? (
                <div className="px-5 py-16 text-center text-sm text-white/30">
                  <History size={28} strokeWidth={1} className="mx-auto mb-3 text-white/30" />
                  <p className="text-base text-white/70">No simulation runs match the current filters.</p>
                  <p className="mt-1 text-xs text-white/35">Try clearing the search or switch back to all statuses.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {enrichedLogs.map((log) => {
                    const isSelected = log.id === selectedLog?.id;
                    return (
                      <button
                        key={log.id}
                        onClick={() => setSelectedLogId(log.id)}
                        className={clsx(
                          'grid w-full grid-cols-1 gap-4 px-5 py-4 text-left transition-colors md:grid-cols-[1.2fr_0.7fr_0.5fr_0.5fr_0.6fr_0.8fr]',
                          isSelected ? 'bg-violet-500/10' : 'hover:bg-white/[0.03]'
                        )}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            {log.success ? (
                              <CheckCircle2 size={14} className="text-emerald-400" />
                            ) : (
                              <XCircle size={14} className="text-red-400" />
                            )}
                            <span className={clsx('text-sm font-medium', log.success ? 'text-emerald-300' : 'text-red-300')}>
                              {log.success ? 'Passed' : 'Failed'}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-white/80">{log.workflowName}</p>
                          <p className="mt-1 text-[11px] text-white/35">Run ID {log.id.slice(0, 8)}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/55">
                          <Clock3 size={13} className="text-white/35" />
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </div>
                        <div className="text-sm text-white/60 tabular-nums">
                          {log.stepCount} step{log.stepCount === 1 ? '' : 's'}
                        </div>
                        <div className="text-sm font-mono text-white/60 tabular-nums">
                          {formatDuration(log.duration_ms)}
                        </div>
                        <div>
                          {log.failedStepCount > 0 ? (
                            <span className="inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-red-300">
                              {log.failedStepCount} error{log.failedStepCount !== 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-[10px] text-white/25">No errors</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2 text-[11px] text-white/40">
                          <span title={format(new Date(log.created_at), 'PPpp')}>{format(new Date(log.created_at), 'MMM d')}</span>
                          <ArrowUpRight size={13} className="text-white/25" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/20 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-white">Run details</h2>
                  <p className="text-xs text-white/35">Selected simulation breakdown</p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/35">
                  {selectedLog ? 'Active' : 'None'}
                </div>
              </div>

              {!selectedLog ? (
                <div className="py-12 text-center text-sm text-white/35">
                  <History size={24} strokeWidth={1} className="mx-auto mb-3 text-white/25" />
                  Select a log to inspect its execution timeline.
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-[#0d0d18] p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Workflow</p>
                    <h3 className="mt-2 text-lg font-semibold text-white">{selectedLog.workflowName}</h3>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/55">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">{selectedLog.success ? 'Passed' : 'Failed'}</span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">{selectedLog.stepCount} steps</span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">{formatDuration(selectedLog.duration_ms)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-[#0d0d18] p-4">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Outcome</p>
                      <p className={clsx('mt-2 text-sm font-medium', selectedLog.success ? 'text-emerald-300' : 'text-red-300')}>
                        {selectedLog.success ? 'Successful run' : 'Failed run'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-[#0d0d18] p-4">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Recorded</p>
                      <p className="mt-2 text-sm font-medium text-white/80">
                        {formatDistanceToNow(new Date(selectedLog.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#0d0d18] p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Step timeline</p>
                      <span className="text-[10px] text-white/30">{stepBreakdown.length} entries</span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {stepBreakdown.length === 0 ? (
                        <p className="text-sm text-white/35">No step payload recorded for this run.</p>
                      ) : (
                        stepBreakdown.map((step) => (
                          <div key={`${step.title}-${step.index}`} className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-medium text-white">{step.title}</p>
                                <p className="mt-1 text-xs text-white/40">{step.type}</p>
                              </div>
                              <span className={clsx('rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider', step.status === 'success' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300')}>
                                {step.status}
                              </span>
                            </div>
                            <p className="mt-2 text-xs leading-relaxed text-white/55">{step.message}</p>
                            <div className="mt-3 flex items-center justify-between text-[11px] text-white/35">
                              <span>{step.timestamp ? format(new Date(step.timestamp), 'PPpp') : 'No timestamp'}</span>
                              <span>{formatDuration(step.durationMs)}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Error summary</p>
                    {selectedLog.errors.length > 0 ? (
                      <ul className="mt-3 space-y-2 text-sm text-white/75">
                        {selectedLog.errors.map((error) => (
                          <li key={error} className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-red-200">
                            {error}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-white/70">No simulation errors captured for this run.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-white/80">
                <Sparkles size={15} className="text-violet-300" />
                <h2 className="text-sm font-semibold text-white">Operational highlights</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm text-white/60">
                <div className="rounded-2xl border border-white/10 bg-[#0d0d18] p-4">
                  <p className="font-medium text-white">Performance tier</p>
                  <p className="mt-1 text-white/45">{getDurationBand(totals.avgDuration)} execution profile</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#0d0d18] p-4">
                  <p className="font-medium text-white">Alert level</p>
                  <p className="mt-1 text-white/45">
                    {totals.failed > 0
                      ? `${totals.failed} failed run${totals.failed > 1 ? 's' : ''} should be reviewed.`
                      : 'No recent failures detected.'}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
