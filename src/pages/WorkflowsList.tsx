import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkflows } from '../hooks/useWorkflows';
import { createWorkflow } from '../api/workflows';
import { logActivity } from '../api/activity';
import {
  ChevronRight,
  Edit2,
  GitBranch,
  Plus,
  Sparkles,
  Trash2,
  Workflow,
  Zap,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import clsx from 'clsx';
import toast from 'react-hot-toast';

export function WorkflowsList() {
  const { workflows, loading, remove, activate } = useWorkflows();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleCreate = async () => {
    setCreating(true);
    try {
      const name = `New Workflow ${new Date().toLocaleDateString()}`;
      const wf = await createWorkflow(name);
      await logActivity('created', `Created new workflow "${name}"`, wf.id, name);
      toast.success('Workflow created');
      navigate(`/workflows/${wf.id}/edit`);
    } catch {
      toast.error('Failed to create workflow');
    } finally {
      setCreating(false);
    }
  };

  const filtered = workflows.filter((w) => statusFilter === 'all' || w.status === statusFilter);

  const stats = useMemo(() => {
    const total = workflows.length;
    const active = workflows.filter((w) => w.status === 'active').length;
    const draft = workflows.filter((w) => w.status === 'draft').length;
    const archived = workflows.filter((w) => w.status === 'archived').length;
    return { total, active, draft, archived };
  }, [workflows]);

  return (
    <div className="relative min-h-full overflow-hidden bg-[#090913] text-white">
      <style>{`
        @keyframes drift {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          33% { transform: translate3d(0, -10px, 0) scale(1.02); }
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
          background: radial-gradient(circle at 25% 12%, rgba(37,99,235,0.08) 0%, transparent 42%);
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
        <div className="ambient-layer absolute -top-24 left-0 h-80 w-80 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="ambient-layer-alt absolute right-0 top-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="ambient-layer absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.16),transparent_35%),radial-gradient(circle_at_80%_16%,rgba(34,211,238,0.11),transparent_33%),linear-gradient(180deg,rgba(9,9,19,0.72),rgba(9,9,19,0.94))]" />
      </div>

      <div className="relative mx-auto max-w-[1520px] space-y-6 p-5 md:p-6 xl:px-10">
        <section className="panel rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/20 backdrop-blur-sm md:p-6">
          <div className="mb-3 flex items-center gap-1 text-xs text-white/35">
            <span>Architect</span>
            <ChevronRight size={12} />
            <span className="text-blue-300">Pipelines</span>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-200">
                <Sparkles size={12} /> Pipeline Orchestration
              </div>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-white md:text-4xl">Pipelines</h1>
              <p className="mt-2 text-sm leading-relaxed text-white/45 md:text-[15px]">
                Build, refine, and deploy workflow pipelines with operational-grade visibility and control.
              </p>
            </div>

            <button
              onClick={handleCreate}
              disabled={creating}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-500 disabled:opacity-50"
            >
              <Plus size={15} />
              {creating ? 'Creating...' : 'New Pipeline'}
            </button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="premium-lift premium-shine relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Total</p>
              <p className="mt-1 text-2xl font-extrabold text-white tabular-nums">{stats.total}</p>
            </div>
            <div className="premium-lift premium-shine relative overflow-hidden rounded-2xl border border-teal-500/20 bg-teal-500/[0.06] p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-200/80">Active</p>
              <p className="mt-1 text-2xl font-extrabold text-emerald-200 tabular-nums">{stats.active}</p>
            </div>
            <div className="premium-lift premium-shine relative overflow-hidden rounded-2xl border border-blue-500/20 bg-blue-500/[0.06] p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-blue-200/80">Draft</p>
              <p className="mt-1 text-2xl font-extrabold text-blue-200 tabular-nums">{stats.draft}</p>
            </div>
            <div className="premium-lift premium-shine relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Archived</p>
              <p className="mt-1 text-2xl font-extrabold text-white/75 tabular-nums">{stats.archived}</p>
            </div>
          </div>
        </section>

        <section className="panel rounded-3xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/20 backdrop-blur-sm">
          <div className="border-b border-white/10 px-5 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                  <Workflow size={12} /> Status Filter
                </span>
                {['all', 'active', 'draft', 'archived'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={clsx(
                      'rounded-full border px-3 py-2 text-xs font-medium capitalize transition-colors',
                      statusFilter === s
                        ? 'border-blue-500/30 bg-blue-500/15 text-blue-200'
                        : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <span className="text-[11px] uppercase tracking-[0.16em] text-white/35">
                {filtered.length} pipeline{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  {['Workflow Name', 'Created', 'Last Updated', 'Status', 'Nodes', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-white/30">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                        <span className="text-xs">Loading workflows...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-sm text-white/30">
                      No pipelines found.
                      <button onClick={handleCreate} className="ml-2 text-blue-300 underline underline-offset-2 hover:text-blue-200">
                        Create your first
                      </button>
                    </td>
                  </tr>
                ) : (
                  filtered.map((wf) => (
                    <tr key={wf.id} className="group transition-colors hover:bg-white/[0.03]">
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-blue-500/25 bg-blue-500/10">
                            <GitBranch size={12} className="text-blue-300" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white/90">{wf.name}</p>
                            {wf.description && <p className="mt-0.5 max-w-xs truncate text-[10px] text-white/35">{wf.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-white/45">{format(new Date(wf.created_at), 'MMM d, yyyy')}</td>
                      <td className="px-5 py-4 text-xs text-white/55">
                        {formatDistanceToNow(new Date(wf.updated_at), { addSuffix: true })}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={clsx(
                            'inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]',
                            wf.status === 'active'
                              ? 'border-teal-500/30 bg-teal-500/12 text-emerald-200'
                              : wf.status === 'archived'
                                ? 'border-white/10 bg-white/5 text-white/30'
                                : 'border-white/10 bg-white/5 text-white/50'
                          )}
                        >
                          {wf.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm tabular-nums text-white/60">{wf.node_count}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/workflows/${wf.id}/edit`)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-white/65 transition-colors hover:border-blue-500/30 hover:bg-blue-500/12 hover:text-blue-200"
                            title="Edit Pipeline"
                          >
                            <Edit2 size={13} />
                            Edit
                          </button>
                          {wf.status !== 'active' && (
                            <button
                              onClick={() => activate(wf.id, wf.name)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-white/65 transition-colors hover:border-teal-500/30 hover:bg-teal-500/12 hover:text-emerald-200"
                              title="Deploy Pipeline"
                            >
                              <Zap size={13} />
                              Deploy
                            </button>
                          )}
                          <button
                            onClick={() => remove(wf.id, wf.name)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-white/65 transition-colors hover:border-rose-500/30 hover:bg-rose-500/12 hover:text-rose-200"
                            title="Delete Pipeline"
                          >
                            <Trash2 size={13} />
                            <span className="hidden lg:inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
