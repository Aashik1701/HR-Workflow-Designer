import { useDashboardStats } from '../hooks/useDashboardStats';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Clock3,
  Network,
  Pencil,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';
import type { ActivityLogRow, WorkflowRow } from '../lib/database.types';

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  helper: string;
  badge?: string;
  badgeTone?: string;
  accent: string;
}

function StatCard({ icon, value, label, helper, badge, badgeTone, accent }: StatCardProps) {
  return (
    <div className="premium-lift premium-shine relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-xl shadow-black/10 backdrop-blur-sm">
      <div className={clsx('absolute inset-0 bg-gradient-to-br opacity-10', accent)} />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">{label}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-white tabular-nums">{value}</p>
          <p className="mt-1 text-xs text-white/45">{helper}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-white/80">{icon}</div>
          {badge && <span className={clsx('rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]', badgeTone)}>{badge}</span>}
        </div>
      </div>
    </div>
  );
}

const activityConfig: Record<string, { dot: string; ring: string }> = {
  modified: { dot: 'bg-indigo-400', ring: 'border-indigo-500/30 bg-indigo-500/10' },
  approved: { dot: 'bg-teal-400', ring: 'border-teal-500/30 bg-teal-500/10' },
  warning: { dot: 'bg-amber-400', ring: 'border-amber-500/30 bg-amber-500/10' },
  created: { dot: 'bg-sky-400', ring: 'border-sky-500/30 bg-sky-500/10' },
  deployed: { dot: 'bg-fuchsia-400', ring: 'border-fuchsia-500/30 bg-fuchsia-500/10' },
};

export function Dashboard() {
  const { stats, recentWorkflows, activity, loading } = useDashboardStats();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          <p className="text-sm font-medium tracking-wide text-white/40">Initializing Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full overflow-hidden bg-[#090913] text-white">
      <style>{`
        @keyframes drift {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          33% { transform: translate3d(0, -12px, 0) scale(1.02); }
          66% { transform: translate3d(0, 8px, 0) scale(0.99); }
        }
        @keyframes sweep {
          0% { transform: translateX(-130%); opacity: 0; }
          35% { opacity: 0.35; }
          100% { transform: translateX(130%); opacity: 0; }
        }
        .ambient-layer { animation: drift 16s ease-in-out infinite; }
        .ambient-layer-alt { animation: drift 21s ease-in-out infinite reverse; }
        .premium-lift {
          transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1), border-color 280ms ease, box-shadow 280ms ease;
        }
        .premium-lift:hover { transform: translateY(-3px); }
        .premium-shine::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(110deg, transparent 24%, rgba(255,255,255,0.14) 48%, transparent 72%);
          transform: translateX(-130%);
          pointer-events: none;
        }
        .premium-shine:hover::before { animation: sweep 900ms ease; }
        .panel {
          position: relative;
          overflow: hidden;
        }
        .panel::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          border: 1px solid rgba(255,255,255,0.06);
          background: radial-gradient(circle at 25% 12%, rgba(124,58,237,0.08) 0%, transparent 42%);
          pointer-events: none;
        }
        @media (pointer: coarse), (prefers-reduced-motion: reduce) {
          .ambient-layer,
          .ambient-layer-alt {
            animation: none !important;
          }
          .premium-lift:hover {
            transform: none;
          }
          .premium-shine:hover::before {
            animation: none;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0">
        <div className="ambient-layer absolute -top-24 left-0 h-80 w-80 rounded-full bg-violet-600/15 blur-3xl" />
        <div className="ambient-layer-alt absolute right-0 top-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="ambient-layer absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.16),transparent_35%),radial-gradient(circle_at_80%_16%,rgba(34,211,238,0.11),transparent_33%),linear-gradient(180deg,rgba(9,9,19,0.72),rgba(9,9,19,0.94))]" />
      </div>

      <div className="relative mx-auto max-w-[1520px] space-y-6 p-5 md:p-6 xl:px-10">
        <section className="panel rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/20 backdrop-blur-sm md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-200">
                <Sparkles size={12} /> Command Operations
              </div>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-white md:text-4xl">Command Center</h1>
              <p className="mt-2 text-sm leading-relaxed text-white/45 md:text-[15px]">
                Orchestrate pipeline health, review recent activity, and launch workflow edits from a unified control plane.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/workflows')}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10"
              >
                View Pipelines
              </button>
              <button
                onClick={() => navigate('/workflows')}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-colors hover:bg-violet-500"
              >
                <ArrowRight size={14} />
                New Pipeline
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<Network size={16} className="text-violet-300" />}
              value={stats.total}
              label="Total Pipelines"
              helper="Registered orchestration flows"
              accent="from-violet-500 to-cyan-500"
            />
            <StatCard
              icon={<Activity size={16} className="text-sky-300" />}
              value={stats.active}
              label="Operational"
              helper="Currently active in runtime"
              badge="Live"
              badgeTone="border-sky-500/30 bg-sky-500/15 text-sky-200"
              accent="from-sky-500 to-cyan-500"
            />
            <StatCard
              icon={<AlertTriangle size={16} className="text-amber-300" />}
              value={stats.failedRuns}
              label="Execution Failures"
              helper="Runs requiring attention"
              badge="Review"
              badgeTone="border-amber-500/30 bg-amber-500/15 text-amber-200"
              accent="from-amber-500 to-fuchsia-500"
            />
            <StatCard
              icon={<Clock3 size={16} className="text-fuchsia-300" />}
              value={stats.draft}
              label="In Development"
              helper="Draft pipelines pending launch"
              badge={`${stats.draft} pending`}
              badgeTone="border-fuchsia-500/30 bg-fuchsia-500/15 text-fuchsia-200"
              accent="from-fuchsia-500 to-violet-500"
            />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.9fr_1fr]">
          <div className="panel rounded-3xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/20 backdrop-blur-sm">
            <div className="border-b border-white/10 px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-white">Latest Pipelines</h2>
                  <p className="text-xs text-white/35">Recent workflows and current deployment state</p>
                </div>
                <button
                  onClick={() => navigate('/workflows')}
                  className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-300 transition-colors hover:text-violet-200"
                >
                  Explore all
                </button>
              </div>
            </div>

            {recentWorkflows.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-white/30">
                No pipelines deployed yet.
                <button
                  onClick={() => navigate('/workflows')}
                  className="ml-2 text-violet-300 underline underline-offset-2 hover:text-violet-200"
                >
                  Create your first
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      {['Pipeline', 'Status', 'Last Modified', 'Action'].map((h) => (
                        <th key={h} className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {recentWorkflows.map((wf: WorkflowRow) => (
                      <tr key={wf.id} className="group transition-colors hover:bg-white/[0.03]">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-500/25 bg-violet-500/10">
                              <Network size={14} className="text-violet-300" />
                            </div>
                            <span className="text-sm font-medium text-white/85">{wf.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={clsx(
                              'inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]',
                              wf.status === 'active'
                                ? 'border-emerald-500/30 bg-emerald-500/12 text-emerald-200'
                                : 'border-white/10 bg-white/5 text-white/45'
                            )}
                          >
                            {wf.status === 'active' ? 'Operational' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-white/55">
                          {formatDistanceToNow(new Date(wf.updated_at), { addSuffix: true })}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => navigate(`/workflows/${wf.id}/edit`)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-white/65 transition-colors hover:border-violet-500/30 hover:bg-violet-500/12 hover:text-violet-200"
                          >
                            <Pencil size={12} />
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="panel rounded-3xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/20 backdrop-blur-sm">
            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="text-sm font-semibold text-white">System Audit Log</h2>
            </div>
            <div className="max-h-[480px] space-y-2 overflow-y-auto p-3">
              {activity.length === 0 ? (
                <div className="px-4 py-10 text-center text-xs text-white/30">System ledger is empty.</div>
              ) : (
                activity.map((a: ActivityLogRow) => {
                  const cfg = activityConfig[a.action_type] ?? activityConfig.modified;
                  return (
                    <div key={a.id} className="premium-lift rounded-xl border border-white/10 bg-[#0d0d18] p-3">
                      <div className="flex items-start gap-3">
                        <div className={clsx('mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border', cfg.ring)}>
                          <div className={clsx('h-2 w-2 rounded-full', cfg.dot)} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center justify-between gap-3">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">{a.action_type.replace('_', ' ')}</p>
                            <p className="text-[10px] text-white/30">{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</p>
                          </div>
                          <p className="text-[11px] text-white/50">{a.user_name}</p>
                          <p className="mt-1 text-[11px] leading-relaxed text-white/40">{a.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
