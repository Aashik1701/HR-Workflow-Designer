import React from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { X, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { useWorkflowStore } from '../../store/workflowStore';

interface BaseNodeProps {
  id: string;
  selected: boolean;
  hasError?: boolean;
  errorMessage?: string;
  /** Tailwind gradient classes for the left accent bar, e.g. "from-emerald-400 to-teal-500" */
  accentGradient: string;
  /** Tailwind text-color for the icon, e.g. "text-emerald-400" */
  accentText: string;
  /** Tailwind bg for the icon pill, e.g. "bg-emerald-500/15" */
  accentPill: string;
  icon: React.ReactNode;
  label: string;
  typeLabel: string;
  subtitle?: string;
  showSourceHandle?: boolean;
  showTargetHandle?: boolean;
  /** Tailwind background class, defaults to bg-[#181828] */
  bgGradient?: string;
  /** Tailwind border class, defaults to border border-white/[0.18] */
  borderGlow?: string;
  children?: React.ReactNode;
}

export function BaseNode({
  id,
  selected,
  hasError,
  errorMessage,
  accentGradient,
  accentText,
  accentPill,
  icon,
  label,
  typeLabel,
  subtitle,
  showSourceHandle = true,
  showTargetHandle = true,
  bgGradient,
  borderGlow,
  children,
}: BaseNodeProps) {
  const { deleteElements } = useReactFlow();
  const playbackNodeId = useWorkflowStore((s) => s.playbackNodeId);
  const playbackStatus = useWorkflowStore((s) => s.playbackStatus);
  const isPlaying = playbackNodeId === id;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  /* ── Playback glow ring ────────────────────────────────────────────────── */
  const playbackRing = isPlaying
    ? playbackStatus === 'success'
      ? 'ring-2 ring-emerald-400 shadow-[0_0_24px_rgba(52,211,153,0.55)] scale-[1.04]'
      : playbackStatus === 'error'
        ? 'ring-2 ring-red-500 shadow-[0_0_24px_rgba(239,68,68,0.55)] scale-[1.04] animate-pulse'
        : 'ring-2 ring-indigo-400 shadow-[0_0_24px_rgba(99,102,241,0.55)] scale-[1.04]'
    : '';

  return (
    <div
      title={hasError ? errorMessage : label}
      className={clsx(
        /* Base shape */
        'relative w-60 rounded-2xl overflow-hidden backdrop-blur-md',
        bgGradient || 'bg-[#181828]',
        borderGlow || 'border border-white/[0.18]',
        'shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.05)]',
        'transition-all duration-300 ease-out',
        /* Selected glow */
        selected && !isPlaying && 'ring-2 ring-violet-500/70 shadow-[0_0_30px_rgba(139,92,246,0.4)]',
        /* Error state */
        hasError && !isPlaying && 'ring-2 ring-red-500/50',
        /* Playback override */
        playbackRing,
      )}
    >
      {/* ── Left accent bar ──────────────────────────────────────────────── */}
      <div
        className={clsx(
          'absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl bg-gradient-to-b',
          accentGradient,
        )}
      />

      {/* ── Subtle top highlight ─────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 pl-4 pr-2.5 pt-3 pb-2.5">
        {/* Icon pill */}
        <div className={clsx('flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0', accentPill)}>
          <span className={clsx('flex items-center justify-center', accentText)}>{icon}</span>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[11px] font-bold text-white/90 tracking-wide truncate leading-none">
              {label}
            </p>
          </div>
          {subtitle && (
            <p className="text-[10px] text-white/40 truncate mt-0.5 leading-none">{subtitle}</p>
          )}
        </div>

        {/* Type badge + delete */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[8px] font-semibold uppercase tracking-[0.18em] text-white/25 border border-white/[0.07] rounded-full px-1.5 py-0.5 bg-white/[0.03]">
            {typeLabel}
          </span>
          <button
            onClick={handleDelete}
            className="text-white/25 hover:text-red-400 transition-colors rounded-md p-0.5 hover:bg-red-400/10"
            title="Delete node"
          >
            <X size={11} />
          </button>
        </div>
      </div>

      {/* ── Divider ──────────────────────────────────────────────────────── */}
      <div className="mx-3 h-px bg-white/[0.1]" />

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      {children && (
        <div className="px-3 py-2.5 text-white/80">
          {children}
        </div>
      )}

      {/* ── Error strip ──────────────────────────────────────────────────── */}
      {hasError && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border-t border-red-500/20">
          <AlertCircle size={10} className="text-red-400 flex-shrink-0" />
          <p className="text-[10px] text-red-400/80 truncate">{errorMessage}</p>
        </div>
      )}

      {/* ── Playback status bar (bottom) ─────────────────────────────────── */}
      {isPlaying && (
        <div
          className={clsx(
            'h-0.5 w-full',
            playbackStatus === 'success' ? 'bg-emerald-400' :
            playbackStatus === 'error'   ? 'bg-red-500 animate-pulse' :
            'bg-indigo-400 animate-pulse',
          )}
        />
      )}

      {/* ── Handles ──────────────────────────────────────────────────────── */}
      {showTargetHandle && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-2.5 !h-2.5 !border-2 !border-[#181828] !bg-white/30 hover:!bg-violet-400 transition-colors"
        />
      )}
      {showSourceHandle && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-2.5 !h-2.5 !border-2 !border-[#181828] !bg-white/30 hover:!bg-violet-400 transition-colors"
        />
      )}
    </div>
  );
}
