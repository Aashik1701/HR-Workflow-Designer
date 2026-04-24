import { CheckCircle2, XCircle, Clock, Play, Loader2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useSimulation } from '../../hooks/useSimulation';
import { useWorkflowStore } from '../../store/workflowStore';
import type { SimulationStep } from '../../types/workflow';
import clsx from 'clsx';

interface SimulationPanelProps {
  workflowId?: string;
  dark?: boolean;
}

const statusConfig = {
  success: { icon: <CheckCircle2 size={12} />, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  error:   { icon: <XCircle size={12} />,      color: 'text-red-600',     bg: 'bg-red-50 border-red-200' },
  running: { icon: <Loader2 size={12} className="animate-spin" />, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  pending: { icon: <Clock size={12} />,         color: 'text-slate-400',   bg: 'bg-slate-50 border-slate-200' },
  skipped: { icon: <Clock size={12} />,         color: 'text-slate-400',   bg: 'bg-slate-50 border-slate-200' },
};

function StepCard({ step, dark }: { step: SimulationStep; dark?: boolean }) {
  const cfg = statusConfig[step.status];
  return (
    <div className={clsx(
      'flex items-start gap-2 p-2.5 rounded-lg border text-xs',
      dark
        ? 'bg-white/5 border-white/5 text-white'
        : cfg.bg
    )}>
      <span className={clsx('mt-0.5 flex-shrink-0', dark ? 'text-emerald-400' : cfg.color)}>{cfg.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={clsx('font-medium', dark ? 'text-white/80' : 'text-slate-700')}>{step.nodeTitle}</p>
        <p className={clsx(dark ? 'text-white/40' : 'text-slate-500')}>{step.message}</p>
        <p className={clsx('text-[10px] mt-0.5', dark ? 'text-white/25' : 'text-slate-400')}>{step.durationMs}ms</p>
      </div>
    </div>
  );
}

export function SimulationPanel({ workflowId, dark }: SimulationPanelProps) {
  const { run, result, loading, error } = useSimulation(workflowId);
  const [playing, setPlaying] = useState(false);
  const [playingStepId, setPlayingStepId] = useState<string | null>(null);
  const { setPlaybackState } = useWorkflowStore();

  const handlePlayback = async () => {
    if (!result) return;
    setPlaying(true);
    for (const step of result.executedSteps) {
      setPlayingStepId(step.nodeId);
      setPlaybackState(step.nodeId, 'running');
      // Simulate delay for node execution
      await new Promise(r => setTimeout(r, Math.max(800, step.durationMs)));
      setPlaybackState(step.nodeId, step.status === 'success' ? 'success' : 'error');
      await new Promise(r => setTimeout(r, 400));
    }
    setPlaying(false);
    setPlayingStepId(null);
    setPlaybackState(null, null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className={clsx('p-4 border-b flex items-center justify-between', dark ? 'border-white/5' : 'border-slate-100')}>
        <div>
          <h2 className={clsx('text-sm font-semibold', dark ? 'text-white' : 'text-slate-700')}>Simulation Sandbox</h2>
          <p className={clsx('text-[10px]', dark ? 'text-white/30' : 'text-slate-400')}>Test your workflow step-by-step</p>
        </div>
        <button
          onClick={run}
          disabled={loading}
          className={clsx(
            'flex items-center gap-1.5 text-white text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
            dark ? 'bg-violet-600 hover:bg-violet-500' : 'bg-indigo-600 hover:bg-indigo-700'
          )}
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
          {loading ? 'Running...' : 'Run Simulation'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {error && (
          <div className={clsx(
            'p-3 rounded-lg border flex gap-2',
            dark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'
          )}>
            <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className={clsx('text-xs font-medium', dark ? 'text-red-400' : 'text-red-700')}>Validation Failed</p>
              {error.split('\n').map((e, i) => (
                <p key={i} className={clsx('text-[11px]', dark ? 'text-red-400/70' : 'text-red-600')}>• {e}</p>
              ))}
            </div>
          </div>
        )}

        {result && (
          <>
            <div className={clsx(
              'p-3 rounded-lg border flex items-center gap-2 text-xs',
              result.success
                ? dark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'
                : dark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'
            )}>
              {result.success
                ? <CheckCircle2 size={14} className="text-emerald-500" />
                : <XCircle size={14} className="text-red-500" />}
              <span className={clsx('font-medium', dark ? 'text-white/80' : '')}>
                {result.success ? 'Simulation Successful' : 'Simulation Failed'}
              </span>
              <span className={clsx('ml-auto', dark ? 'text-white/30' : 'text-slate-400')}>
                {result.totalSteps} steps
              </span>
            </div>

            <button
              onClick={handlePlayback}
              disabled={playing}
              className={clsx(
                'w-full flex items-center justify-center gap-2 text-xs px-3 py-2 rounded-lg transition-colors border font-medium mb-4',
                playing 
                  ? 'bg-white/5 border-white/5 text-white/40 cursor-wait'
                  : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20'
              )}
            >
              {playing ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
              {playing ? 'Playing Back...' : '▶️ Playback on Canvas'}
            </button>

            <div className="space-y-2">
              {result.executedSteps.map((step, i) => (
                <div key={step.nodeId} className="flex gap-2">
                  <div className="flex flex-col items-center">
                    <div className={clsx(
                      'w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 transition-colors duration-500',
                      playingStepId === step.nodeId 
                        ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                        : dark ? 'bg-violet-500/20 text-violet-400' : 'bg-indigo-100 text-indigo-600'
                    )}>
                      {i + 1}
                    </div>
                    {i < result.executedSteps.length - 1 && (
                      <div className={clsx('w-px flex-1 my-1', dark ? 'bg-white/10' : 'bg-slate-200')} />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <StepCard step={step} dark={dark} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!result && !error && !loading && (
          <div className={clsx('flex flex-col items-center justify-center h-40 gap-2', dark ? 'text-white/25' : 'text-slate-400')}>
            <Play size={24} strokeWidth={1} />
            <p className="text-xs text-center">Build a workflow and click Run to test it</p>
          </div>
        )}
      </div>
    </div>
  );
}
