import React from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { X, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface BaseNodeProps {
  id: string;
  selected: boolean;
  hasError?: boolean;
  errorMessage?: string;
  accentColor: string;
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  showSourceHandle?: boolean;
  showTargetHandle?: boolean;
  children?: React.ReactNode;
  dark?: boolean;
}

import { useWorkflowStore } from '../../store/workflowStore';

export function BaseNode({
  id,
  selected,
  hasError,
  errorMessage,
  accentColor,
  icon,
  label,
  subtitle,
  showSourceHandle = true,
  showTargetHandle = true,
  children,
  dark,
}: BaseNodeProps) {
  const { deleteElements } = useReactFlow();
  const playbackNodeId = useWorkflowStore(s => s.playbackNodeId);
  const playbackStatus = useWorkflowStore(s => s.playbackStatus);
  const isPlaying = playbackNodeId === id;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  const playbackGlow = isPlaying 
    ? playbackStatus === 'success' 
      ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)] scale-105 z-50'
      : playbackStatus === 'error'
        ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] scale-105 z-50'
        : 'border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.5)] scale-105 z-50'
    : '';

  return (
    <div
      className={clsx(
        'relative w-56 rounded-xl border-2 shadow-md transition-all duration-300',
        dark ? 'bg-[#1a1a2e] border-white/10' : 'bg-white border-slate-200',
        selected && !isPlaying
          ? dark ? 'border-violet-500 shadow-violet-500/20 shadow-lg' : 'border-indigo-500 shadow-indigo-100 shadow-lg'
          : '',
        hasError && !isPlaying && (dark ? 'border-red-400/50 shadow-red-500/10' : 'border-red-400 shadow-red-100'),
        playbackGlow
      )}
    >
      {/* Header */}
      <div className={clsx('flex items-center gap-2 rounded-t-xl px-3 py-2', accentColor)}>
        <span className="text-white">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">{label}</p>
          {subtitle && <p className="text-[10px] text-white/70 truncate">{subtitle}</p>}
        </div>
        <button
          onClick={handleDelete}
          className="text-white/60 hover:text-white transition-colors"
          title="Delete node"
        >
          <X size={12} />
        </button>
      </div>

      {/* Body */}
      {children && <div className={clsx('px-3 py-2', dark && 'text-white/80')}>{children}</div>}

      {/* Error badge */}
      {hasError && (
        <div className={clsx(
          'flex items-center gap-1 px-3 py-1 rounded-b-xl border-t',
          dark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'
        )}>
          <AlertCircle size={10} className={dark ? 'text-red-400 flex-shrink-0' : 'text-red-500 flex-shrink-0'} />
          <p className={clsx('text-[10px] truncate', dark ? 'text-red-400/80' : 'text-red-600')}>{errorMessage}</p>
        </div>
      )}

      {/* Handles */}
      {showTargetHandle && (
        <Handle
          type="target"
          position={Position.Top}
          className={clsx(
            '!w-3 !h-3 !border-2 transition-colors',
            dark ? '!bg-white/20 !border-[#1a1a2e] hover:!bg-violet-400' : '!bg-slate-400 !border-white hover:!bg-indigo-500'
          )}
        />
      )}
      {showSourceHandle && (
        <Handle
          type="source"
          position={Position.Bottom}
          className={clsx(
            '!w-3 !h-3 !border-2 transition-colors',
            dark ? '!bg-white/20 !border-[#1a1a2e] hover:!bg-violet-400' : '!bg-slate-400 !border-white hover:!bg-indigo-500'
          )}
        />
      )}
    </div>
  );
}
