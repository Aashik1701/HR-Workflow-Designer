import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutomations } from '../hooks/useAutomations';
import { createWorkflow, saveWorkflow } from '../api/workflows';
import { logActivity } from '../api/activity';
import toast from 'react-hot-toast';
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Code2,
  Database,
  FileText,
  Globe,
  Layers3,
  Pin,
  Sparkles,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import clsx from 'clsx';
import type { AutomationRow } from '../lib/database.types';

type CategoryFilter = 'all' | AutomationRow['category'];
type SortMode = 'recommended' | 'label' | 'category' | 'sla';

const CATEGORY_META: Record<AutomationRow['category'], { label: string; tone: string; icon: LucideIcon }> = {
  communication: { label: 'Communication', tone: 'from-sky-500/20 to-cyan-500/10 text-sky-300', icon: Activity },
  documents: { label: 'Documents', tone: 'from-amber-500/20 to-orange-500/10 text-amber-300', icon: FileText },
  integrations: { label: 'Integrations', tone: 'from-violet-500/20 to-fuchsia-500/10 text-violet-300', icon: Globe },
  database: { label: 'Data Ops', tone: 'from-emerald-500/20 to-teal-500/10 text-emerald-300', icon: Database },
  productivity: { label: 'Productivity', tone: 'from-pink-500/20 to-rose-500/10 text-pink-300', icon: Layers3 },
  general: { label: 'General', tone: 'from-white/15 to-white/5 text-white/60', icon: Code2 },
};

function getAutomationIcon(automation: AutomationRow) {
  const IconName = automation.icon
    .split('-')
    .map((segment: string) => segment[0].toUpperCase() + segment.slice(1))
    .join('');

  return (LucideIcons as unknown as Record<string, LucideIcon>)[IconName] ?? Zap;
}

function getAutomationScore(automation: AutomationRow) {
  const base = automation.is_active ? 72 : 55;
  const categoryBonus: Record<AutomationRow['category'], number> = {
    communication: 10,
    documents: 8,
    integrations: 12,
    database: 6,
    productivity: 9,
    general: 4,
  };
  return Math.min(99, base + categoryBonus[automation.category] + automation.params.length * 2);
}

function AutomationCard({
  automation,
  active,
  pinned,
  onSelect,
  onGenerate,
  onTogglePin,
}: {
  automation: AutomationRow;
  active: boolean;
  pinned: boolean;
  onSelect: () => void;
  onGenerate: () => void;
  onTogglePin: () => void;
}) {
  const Icon = getAutomationIcon(automation);
  const meta = CATEGORY_META[automation.category] ?? CATEGORY_META.general;
  const score = getAutomationScore(automation);

  return (
    <button
      onClick={onSelect}
      className={clsx(
        'premium-lift premium-shine group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border p-6 text-left transition-all duration-300',
        active
          ? 'border-violet-500/40 bg-violet-500/10 shadow-xl shadow-violet-950/20'
          : 'border-white/10 bg-white/[0.03] hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05]'
      )}
    >
      <div className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-gradient-to-br from-violet-500/0 via-cyan-500/0 to-fuchsia-500/0 group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={clsx('rounded-2xl border p-3 shadow-lg', meta.tone)}>
            <Icon size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white transition-colors group-hover:text-violet-200">
                {automation.label}
              </h3>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/45">
                Score {score}
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-white/45">{automation.description}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onTogglePin();
            }}
            className={clsx(
              'inline-flex items-center justify-center rounded-lg border p-1.5 transition-colors',
              pinned
                ? 'border-amber-400/30 bg-amber-400/20 text-amber-200'
                : 'border-white/10 bg-white/5 text-white/45 hover:bg-white/10 hover:text-white/80'
            )}
            aria-label={pinned ? 'Unpin action' : 'Pin action'}
          >
            <Pin size={12} />
          </button>
          <span className={clsx('mt-1 inline-flex h-2.5 w-2.5 rounded-full shadow-[0_0_16px_rgba(52,211,153,0.7)]', automation.is_active ? 'bg-emerald-400' : 'bg-white/30')} title={automation.is_active ? 'Active' : 'Standby'} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {automation.params.slice(0, 4).map((param) => (
          <span key={param} className="rounded-lg border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] font-mono text-white/55">
            {param}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 pt-5 mt-auto">
        <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]', meta.tone)}>
          <meta.icon size={12} />
          {meta.label}
        </span>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onGenerate();
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-xs font-medium text-violet-200 transition-colors hover:bg-violet-500/20"
        >
          Build template
          <ArrowRight size={12} />
        </button>
      </div>
    </button>
  );
}

function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  accent: string;
}) {
  return (
    <div className="premium-lift premium-shine relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-xl shadow-black/10 backdrop-blur-sm">
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-10`} />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">{label}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-white">{value}</p>
          <p className="mt-1 text-xs text-white/45">{helper}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-white/80">
          <Icon size={16} />
        </div>
      </div>
    </div>
  );
}

export function Automations() {
  const { automations, loading } = useAutomations();
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('recommended');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeOnly, setActiveOnly] = useState(true);
  const [priorityOnly, setPriorityOnly] = useState(false);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const mobileViewport = window.innerWidth < 900;
    const disableParallax = reducedMotion || coarsePointer || mobileViewport;

    root.style.setProperty('--pmx', '0');
    root.style.setProperty('--pmy', '0');

    if (disableParallax) return;

    let rafId: number | null = null;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const animate = () => {
      cx += (tx - cx) * 0.1;
      cy += (ty - cy) * 0.1;
      root.style.setProperty('--pmx', cx.toFixed(4));
      root.style.setProperty('--pmy', cy.toFixed(4));
      rafId = window.requestAnimationFrame(animate);
    };

    const onPointerMove = (event: PointerEvent) => {
      const nx = event.clientX / window.innerWidth - 0.5;
      const ny = event.clientY / window.innerHeight - 0.5;
      tx = nx * 2;
      ty = ny * 2;
      if (rafId === null) {
        rafId = window.requestAnimationFrame(animate);
      }
    };

    const onLeave = () => {
      tx = 0;
      ty = 0;
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerleave', onLeave);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onLeave);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const isTypingTarget = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (isTypingTarget) return;
      event.preventDefault();
      searchRef.current?.focus();
      searchRef.current?.select();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const filteredAutomations = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = automations.filter((automation) => {
      const categoryMatch = categoryFilter === 'all' || automation.category === categoryFilter;
      const activeMatch = !activeOnly || automation.is_active;
      const priorityMatch = !priorityOnly || getAutomationScore(automation) >= 85;
      const queryMatch =
        q.length === 0 ||
        automation.label.toLowerCase().includes(q) ||
        automation.description.toLowerCase().includes(q) ||
        automation.params.some((param) => param.toLowerCase().includes(q));
      return categoryMatch && activeMatch && priorityMatch && queryMatch;
    });

    const sorted = [...matched].sort((left, right) => {
      const pinDelta = Number(pinnedIds.includes(right.id)) - Number(pinnedIds.includes(left.id));
      if (pinDelta !== 0) return pinDelta;

      switch (sortMode) {
        case 'label':
          return left.label.localeCompare(right.label);
        case 'category':
          return left.category.localeCompare(right.category) || left.label.localeCompare(right.label);
        case 'sla':
          return getAutomationScore(right) - getAutomationScore(left) || left.label.localeCompare(right.label);
        case 'recommended':
        default:
          return getAutomationScore(right) - getAutomationScore(left);
      }
    });

    return sorted;
  }, [automations, categoryFilter, query, sortMode, activeOnly, priorityOnly, pinnedIds]);

  const selectedAutomation = useMemo(
    () => filteredAutomations.find((automation) => automation.id === selectedId) ?? filteredAutomations[0] ?? null,
    [filteredAutomations, selectedId]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: automations.length };
    automations.forEach((automation) => {
      counts[automation.category] = (counts[automation.category] ?? 0) + 1;
    });
    return counts;
  }, [automations]);

  const averageParams = useMemo(() => {
    if (automations.length === 0) return '0.0';
    return (automations.reduce((sum, automation) => sum + automation.params.length, 0) / automations.length).toFixed(1);
  }, [automations]);

  const activeAutomationsCount = useMemo(
    () => automations.filter((automation) => automation.is_active).length,
    [automations]
  );

  const highPriorityCount = useMemo(
    () => automations.filter((automation) => getAutomationScore(automation) >= 85).length,
    [automations]
  );

  const avgOperationalScore = useMemo(() => {
    if (automations.length === 0) return '0';
    const totalScore = automations.reduce((sum, automation) => sum + getAutomationScore(automation), 0);
    return Math.round(totalScore / automations.length).toString();
  }, [automations]);

  const togglePin = (id: string) => {
    setPinnedIds((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));
  };

  const handleCreateTemplate = async (automation: AutomationRow) => {
    setCreating(true);
    try {
      const name = `${automation.label} Pipeline`;
      const wf = await createWorkflow(name, `Auto-generated template utilizing ${automation.label}`);

      const nodes = [
        { id: 'start-node', type: 'startNode', position: { x: 250, y: 100 }, data: { type: 'startNode', title: 'Entry Point', metadata: [] } },
        {
          id: 'auto-node',
          type: 'automatedStepNode',
          position: { x: 250, y: 250 },
          data: { type: 'automatedStepNode', title: automation.label, actionId: automation.id, actionParams: {} },
        },
        { id: 'end-node', type: 'endNode', position: { x: 250, y: 400 }, data: { type: 'endNode', endMessage: 'Process Complete', summaryFlag: false } },
      ];

      const edges = [
        { id: 'e1', source: 'start-node', target: 'auto-node', type: 'smoothstep' },
        { id: 'e2', source: 'auto-node', target: 'end-node', type: 'smoothstep' },
      ];

      await saveWorkflow(wf.id, nodes, edges);
      await logActivity('created', `Bootstrapped ${name} from Automations library`, wf.id, name);

      toast.success(`${name} initialized`);
      navigate(`/workflows/${wf.id}/edit`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate pipeline template');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div ref={rootRef} className="relative min-h-full overflow-hidden bg-[#090913] text-white">
      <style>{`
        @keyframes cinematicDrift {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          33% { transform: translate3d(0, -16px, 0) scale(1.03); }
          66% { transform: translate3d(0, 10px, 0) scale(0.985); }
        }
        @keyframes sweepLight {
          0% { transform: translateX(-130%); opacity: 0; }
          30% { opacity: 0.35; }
          100% { transform: translateX(130%); opacity: 0; }
        }
        @keyframes textShimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .cinematic-layer {
          animation: cinematicDrift 14s ease-in-out infinite;
          will-change: transform;
          transform: translate3d(calc(var(--pmx, 0) * 16px), calc(var(--pmy, 0) * 14px), 0);
        }
        .cinematic-layer-reverse {
          animation: cinematicDrift 19s ease-in-out infinite reverse;
          will-change: transform;
          transform: translate3d(calc(var(--pmx, 0) * -18px), calc(var(--pmy, 0) * -14px), 0);
        }
        .premium-lift {
          transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1), border-color 280ms ease, box-shadow 280ms ease;
          will-change: transform;
        }
        .premium-lift:hover {
          transform: translateY(-4px);
        }
        .premium-shine::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.16) 48%, transparent 72%);
          transform: translateX(-130%);
          pointer-events: none;
        }
        .premium-shine:hover::before {
          animation: sweepLight 900ms ease;
        }
        .hero-gradient-title {
          background-image: linear-gradient(98deg, #f8fafc 0%, #22d3ee 36%, #a78bfa 58%, #d946ef 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: textShimmer 10s linear infinite;
        }
        .cinematic-panel {
          position: relative;
          overflow: hidden;
        }
        .cinematic-panel::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          border: 1px solid rgba(255,255,255,0.06);
          background: radial-gradient(circle at 30% 10%, rgba(124,58,237,0.1) 0%, transparent 42%);
          pointer-events: none;
        }
        @media (pointer: coarse), (prefers-reduced-motion: reduce) {
          .cinematic-layer,
          .cinematic-layer-reverse,
          .hero-gradient-title {
            animation: none !important;
            transform: none !important;
          }
          .premium-lift:hover {
            transform: none;
          }
          .premium-shine:hover::before {
            animation: none;
          }
        }
      `}</style>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-0 rounded-full cinematic-layer -top-24 h-80 w-80 bg-violet-600/15 blur-3xl" />
        <div className="absolute right-0 rounded-full cinematic-layer-reverse top-20 h-96 w-96 bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 rounded-full cinematic-layer left-1/3 h-72 w-72 bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.16),transparent_35%),radial-gradient(circle_at_80%_16%,rgba(34,211,238,0.12),transparent_33%),linear-gradient(180deg,rgba(9,9,19,0.72),rgba(9,9,19,0.94))]" />
        <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:56px_56px]" />
      </div>

      <div className="relative mx-auto max-w-[1520px] space-y-6 p-5 md:p-6 xl:px-10">
        <section className="cinematic-panel rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/20 backdrop-blur-sm md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-200">
                <Sparkles size={12} /> Automation Foundry
              </div>
              <h1 className="mt-2 text-2xl font-black tracking-tight hero-gradient-title md:text-4xl">
                Automation Foundry
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/45 md:text-[15px]">
                Craft, launch, and scale HR automation across every workflow layer. Search the catalog, compare readiness, and generate templates directly from the library.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10"
              >
                <ArrowRight size={14} />
                Go to Dashboard
              </button>
              <button className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-colors hover:bg-violet-500">
                <Zap size={14} />
                Browse templates
              </button>
            </div>
          </div>

          <div className="grid gap-3 mt-5 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Available actions"
              value={automations.length.toString()}
              helper="Ready-to-generate automation blocks"
              icon={Zap}
              accent="from-violet-500 to-cyan-500"
            />
            <StatCard
              label="Category mix"
              value={Object.keys(categoryCounts).filter((key) => key !== 'all').length.toString()}
              helper="Distinct automation families"
              icon={Layers3}
              accent="from-emerald-500 to-cyan-500"
            />
            <StatCard
              label="Avg params"
              value={averageParams}
              helper="Typical config depth per action"
              icon={FileText}
              accent="from-amber-500 to-fuchsia-500"
            />
            <StatCard
              label="Template speed"
              value={creating ? 'Busy' : 'Fast'}
              helper="Create a workflow from any action"
              icon={Clock3}
              accent="from-sky-500 to-violet-500"
            />
          </div>

          <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-[#0d0d18]/70 p-4 lg:grid-cols-[1.35fr_1fr_auto] lg:items-center">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">Ops command state</p>
              <p className="mt-1 text-sm text-white/80">{activeAutomationsCount} active agents, {highPriorityCount} high-priority templates, health index {avgOperationalScore}/99</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveOnly((value) => !value)}
                className={clsx('rounded-full border px-3 py-1.5 text-xs font-medium transition-colors', activeOnly ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200' : 'border-white/10 bg-white/5 text-white/50 hover:text-white')}
              >
                Active only
              </button>
              <button
                onClick={() => setPriorityOnly((value) => !value)}
                className={clsx('rounded-full border px-3 py-1.5 text-xs font-medium transition-colors', priorityOnly ? 'border-amber-400/30 bg-amber-500/15 text-amber-200' : 'border-white/10 bg-white/5 text-white/50 hover:text-white')}
              >
                Priority ≥ 85
              </button>
            </div>
            <button
              onClick={() => searchRef.current?.focus()}
              className="inline-flex items-center justify-center px-3 py-2 text-xs font-semibold transition-colors border rounded-xl border-violet-500/25 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20"
            >
              Focus search /
            </button>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.9fr_1fr] 2xl:grid-cols-[2.05fr_1fr]">
          <div className="space-y-6">
            <div className="cinematic-panel rounded-3xl border border-white/10 bg-white/[0.03] p-4 shadow-xl shadow-black/10 backdrop-blur-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative flex-1">
                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search actions, nodes, or runbook signals"
                    className="w-full rounded-2xl border border-white/10 bg-[#0d0d18] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-violet-500/40"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    <FilterIcon />
                    Filters
                  </span>
                  {(['all', 'communication', 'documents', 'integrations', 'database', 'productivity', 'general'] as const).map((option) => {
                    const count = option === 'all' ? automations.length : categoryCounts[option] ?? 0;
                    return (
                      <button
                        key={option}
                        onClick={() => setCategoryFilter(option)}
                        className={clsx(
                          'rounded-full border px-3 py-2 text-xs font-medium capitalize transition-colors',
                          categoryFilter === option
                            ? 'border-violet-500/30 bg-violet-500/15 text-violet-200'
                            : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                        )}
                      >
                        {option === 'all' ? 'All' : CATEGORY_META[option].label} · {count}
                      </button>
                    );
                  })}
                  <select
                    value={sortMode}
                    onChange={(event) => setSortMode(event.target.value as SortMode)}
                    className="rounded-full border border-white/10 bg-[#0d0d18] px-3 py-2 text-xs text-white/70 outline-none"
                  >
                    <option value="recommended">Recommended first</option>
                    <option value="sla">Operational priority</option>
                    <option value="label">Alphabetical</option>
                    <option value="category">Category</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="cinematic-panel premium-lift rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-xl shadow-black/10 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-white">Automation map</h2>
                    <p className="text-xs text-white/35">Grouped by category for faster discovery</p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/40">
                    {filteredAutomations.length} visible
                  </div>
                </div>

                <div className="space-y-3">
                  {Object.entries(CATEGORY_META).map(([category, meta]) => {
                    const count = categoryCounts[category] ?? 0;
                    const pct = automations.length > 0 ? Math.max(6, (count / automations.length) * 100) : 0;
                    return (
                      <div key={category} className="premium-lift rounded-2xl border border-white/10 bg-[#0d0d18] p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <div className={clsx('rounded-xl border p-2', meta.tone)}>
                              <meta.icon size={14} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{meta.label}</p>
                              <p className="mt-1 text-xs text-white/40">{count} action{count === 1 ? '' : 's'}</p>
                            </div>
                          </div>
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-white/45">
                            {Math.round(pct)}%
                          </span>
                        </div>
                        <div className="h-2 mt-3 overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="cinematic-panel premium-lift rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-xl shadow-black/10 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-white">Automation readiness</h2>
                    <p className="text-xs text-white/35">Insights from the current catalog</p>
                  </div>
                  <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-emerald-200">
                    Live
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="premium-lift rounded-2xl border border-white/10 bg-[#0d0d18] p-4">
                    <div className="flex items-center gap-2 text-violet-300">
                      <CheckCircle2 size={14} />
                      <span className="text-xs font-semibold uppercase tracking-[0.18em]">Template coverage</span>
                    </div>
                    <p className="mt-2 text-sm text-white/80">
                      Each automation action can be turned into a workflow template in one click, with Start → Action → End scaffolding.
                    </p>
                  </div>
                  <div className="premium-lift rounded-2xl border border-white/10 bg-[#0d0d18] p-4">
                    <div className="flex items-center gap-2 text-cyan-300">
                      <Activity size={14} />
                      <span className="text-xs font-semibold uppercase tracking-[0.18em]">Category spread</span>
                    </div>
                    <p className="mt-2 text-sm text-white/80">
                      {automations.length > 0
                        ? `${Object.keys(categoryCounts).filter((key) => key !== 'all').length} automation families are available for reuse across the HR ecosystem.`
                        : 'No automation catalog loaded yet.'}
                    </p>
                  </div>
                  <div className="premium-lift rounded-2xl border border-white/10 bg-[#0d0d18] p-4">
                    <div className="flex items-center gap-2 text-amber-300">
                      <BarChart3 size={14} />
                      <span className="text-xs font-semibold uppercase tracking-[0.18em]">Generation momentum</span>
                    </div>
                    <p className="mt-2 text-sm text-white/80">
                      Recommended sorting ranks by score, which balances category breadth, parameter richness, and active status.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="cinematic-panel rounded-3xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/20 backdrop-blur-sm">
              <div className="px-5 py-4 border-b border-white/10">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-semibold text-white">Automation catalog</h2>
                    <p className="text-xs text-white/35">Operational queue with pinned-first ranking and one-click template dispatch</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-white/30">
                    {filteredAutomations.length} result{filteredAutomations.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="px-5 text-center py-14">
                  <div className="flex flex-col items-center max-w-xs gap-3 mx-auto text-white/35">
                    <div className="w-6 h-6 border-2 rounded-full animate-spin border-violet-500 border-t-transparent" />
                    <p className="text-sm">Loading automations...</p>
                  </div>
                </div>
              ) : filteredAutomations.length === 0 ? (
                <div className="px-5 py-16 text-sm text-center text-white/30">
                  <Zap size={28} strokeWidth={1} className="mx-auto mb-3 text-white/30" />
                  <p className="text-base text-white/70">No automation actions match the current filters.</p>
                  <p className="mt-1 text-xs text-white/35">Clear the search or switch to a different category.</p>
                </div>
              ) : (
                <div className="grid gap-5 p-5 auto-rows-fr md:grid-cols-2 2xl:grid-cols-3">
                  {filteredAutomations.map((automation) => (
                    <AutomationCard
                      key={automation.id}
                      automation={automation}
                      active={automation.id === selectedAutomation?.id}
                      pinned={pinnedIds.includes(automation.id)}
                      onSelect={() => setSelectedId(automation.id)}
                      onGenerate={() => handleCreateTemplate(automation)}
                      onTogglePin={() => togglePin(automation.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
            <div className="cinematic-panel rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/20 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-white">Action detail</h2>
                  <p className="text-xs text-white/35">Selected automation preview</p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/35">
                  {selectedAutomation ? 'Ready' : 'None'}
                </div>
              </div>

              {!selectedAutomation ? (
                <div className="py-12 text-sm text-center text-white/35">
                  <Zap size={24} strokeWidth={1} className="mx-auto mb-3 text-white/25" />
                  Select an automation card to inspect its parameters and generate a template.
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  <div className="premium-lift rounded-2xl border border-white/10 bg-[#0d0d18] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Selected automation</p>
                        <h3 className="mt-2 text-lg font-semibold text-white">{selectedAutomation.label}</h3>
                        <p className="mt-2 text-sm text-white/45">{selectedAutomation.description}</p>
                      </div>
                      <span className={clsx('rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider', selectedAutomation.is_active ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200' : 'border-white/10 bg-white/5 text-white/35')}>
                        {selectedAutomation.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="premium-lift rounded-2xl border border-white/10 bg-[#0d0d18] p-4">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Category</p>
                      <p className="mt-2 text-sm font-medium text-white">{CATEGORY_META[selectedAutomation.category].label}</p>
                    </div>
                    <div className="premium-lift rounded-2xl border border-white/10 bg-[#0d0d18] p-4">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Recommended score</p>
                      <p className="mt-2 text-sm font-medium text-white">{getAutomationScore(selectedAutomation)} / 99</p>
                    </div>
                  </div>

                  <div className="premium-lift rounded-2xl border border-white/10 bg-[#0d0d18] p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Required parameters</p>
                      <span className="text-[10px] text-white/30">{selectedAutomation.params.length} fields</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedAutomation.params.map((param) => (
                        <span key={param} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-mono text-white/65">
                          {param}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 border premium-lift rounded-2xl border-white/10 bg-gradient-to-br from-violet-500/10 to-cyan-500/10">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Next step</p>
                    <p className="mt-2 text-sm text-white/75">
                      Generate a workflow template from this action to get a ready-made Start → Action → End flow.
                    </p>
                    <button
                      onClick={() => handleCreateTemplate(selectedAutomation)}
                      disabled={creating}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-colors hover:bg-violet-500 disabled:opacity-50"
                    >
                      <ArrowRight size={14} />
                      {creating ? 'Building...' : 'Generate template'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="cinematic-panel rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-white/80">
                <Sparkles size={15} className="text-violet-300" />
                <h2 className="text-sm font-semibold text-white">Command runbook</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm text-white/60">
                <div className="premium-lift rounded-2xl border border-white/10 bg-[#0d0d18] p-4">
                  <p className="font-medium text-white">Pinned operations</p>
                  <p className="mt-1 text-white/45">{pinnedIds.length > 0 ? `${pinnedIds.length} action${pinnedIds.length === 1 ? '' : 's'} pinned for quick dispatch.` : 'Pin high-value actions from the catalog to create your rapid-response queue.'}</p>
                </div>
                <div className="premium-lift rounded-2xl border border-white/10 bg-[#0d0d18] p-4">
                  <p className="font-medium text-white">Priority lane</p>
                  <p className="mt-1 text-white/45">Use Active-only and Priority filters to focus on production-ready automations during incidents.</p>
                </div>
                <div className="premium-lift rounded-2xl border border-white/10 bg-[#0d0d18] p-4">
                  <p className="font-medium text-white">Command shortcut</p>
                  <p className="mt-1 text-white/45">Press / anywhere on this page to jump directly to search and dispatch actions faster.</p>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}

function FilterIcon() {
  return <Layers3 size={12} />;
}
