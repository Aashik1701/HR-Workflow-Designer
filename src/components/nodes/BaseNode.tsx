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
}

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
}: BaseNodeProps) {
  const { deleteElements } = useReactFlow();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  return (
    <div
      className={clsx(
        'relative w-56 rounded-xl border-2 bg-white shadow-md transition-all duration-200',
        selected ? 'border-indigo-500 shadow-indigo-100 shadow-lg' : 'border-slate-200',
        hasError && 'border-red-400 shadow-red-100'
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
      {children && <div className="px-3 py-2">{children}</div>}

      {/* Error badge */}
      {hasError && (
        <div className="flex items-center gap-1 px-3 py-1 bg-red-50 rounded-b-xl border-t border-red-200">
          <AlertCircle size={10} className="text-red-500 flex-shrink-0" />
          <p className="text-[10px] text-red-600 truncate">{errorMessage}</p>
        </div>
      )}

      {/* Handles */}
      {showTargetHandle && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white hover:!bg-indigo-500 transition-colors"
        />
      )}
      {showSourceHandle && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white hover:!bg-indigo-500 transition-colors"
        />
      )}
    </div>
  );
}
