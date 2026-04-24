import { CheckCircle2, XCircle, Clock, Play, Loader2, AlertTriangle } from 'lucide-react';
import { useSimulation } from '../../hooks/useSimulation';
import type { SimulationStep } from '../../types/workflow';
import clsx from 'clsx';

const statusConfig = {
  success: { icon: <CheckCircle2 size={12} />, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  error:   { icon: <XCircle size={12} />,      color: 'text-red-600',     bg: 'bg-red-50 border-red-200' },
  running: { icon: <Loader2 size={12} className="animate-spin" />, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  pending: { icon: <Clock size={12} />,         color: 'text-slate-400',   bg: 'bg-slate-50 border-slate-200' },
  skipped: { icon: <Clock size={12} />,         color: 'text-slate-400',   bg: 'bg-slate-50 border-slate-200' },
};

function StepCard({ step }: { step: SimulationStep }) {
  const cfg = statusConfig[step.status];
  return (
    <div className={clsx('flex items-start gap-2 p-2.5 rounded-lg border text-xs', cfg.bg)}>
      <span className={clsx('mt-0.5 flex-shrink-0', cfg.color)}>{cfg.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-700">{step.nodeTitle}</p>
        <p className="text-slate-500">{step.message}</p>
        <p className="text-slate-400 text-[10px] mt-0.5">{step.durationMs}ms</p>
      </div>
    </div>
  );
}

export function SimulationPanel() {
  const { run, result, loading, error } = useSimulation();

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">Simulation Sandbox</h2>
          <p className="text-[10px] text-slate-400">Test your workflow step-by-step</p>
        </div>
        <button
          onClick={run}
          disabled={loading}
          className="flex items-center gap-1.5 bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg
                     hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
          {loading ? 'Running...' : 'Run Simulation'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* Error state */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
            <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-red-700">Validation Failed</p>
              {error.split('\n').map((e, i) => (
                <p key={i} className="text-[11px] text-red-600">• {e}</p>
              ))}
            </div>
          </div>
        )}

        {/* Success summary */}
        {result && (
          <>
            <div className={clsx(
              'p-3 rounded-lg border flex items-center gap-2 text-xs',
              result.success ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
            )}>
              {result.success
                ? <CheckCircle2 size={14} className="text-emerald-600" />
                : <XCircle size={14} className="text-red-600" />}
              <span className="font-medium">
                {result.success ? 'Simulation Successful' : 'Simulation Failed'}
              </span>
              <span className="ml-auto text-slate-400">{result.totalSteps} steps</span>
            </div>

            {/* Step timeline */}
            <div className="space-y-2">
              {result.executedSteps.map((step, i) => (
                <div key={step.nodeId} className="flex gap-2">
                  <div className="flex flex-col items-center">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    {i < result.executedSteps.length - 1 && (
                      <div className="w-px flex-1 bg-slate-200 my-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <StepCard step={step} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {!result && !error && !loading && (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
            <Play size={24} strokeWidth={1} />
            <p className="text-xs text-center">Build a workflow and click Run to test it</p>
          </div>
        )}
      </div>
    </div>
  );
}
