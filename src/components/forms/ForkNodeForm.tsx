import { GitFork, Merge } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import type { ForkNodeData } from '../../types/workflow';

interface Props { nodeId: string; data: ForkNodeData; }

export function ForkNodeForm({ nodeId, data }: Props) {
  const { updateNodeData } = useWorkflowStore();

  const inputClass = "w-full text-xs border border-white/10 bg-[#12121a] text-white placeholder-white/30 rounded px-2 py-1.5 focus:ring-1 ring-pink-500 outline-none";
  const labelClass = "block text-xs font-medium text-white/70 mb-1";

  const upd = (patch: Partial<ForkNodeData>) =>
    updateNodeData(nodeId, { ...data, ...patch });

  const setBranches = (count: number) => {
    const clamped = Math.max(2, Math.min(8, count));
    const current = data.branchLabels ?? [];
    // Extend or trim branch label array
    const next = Array.from({ length: clamped }, (_, i) => current[i] ?? `Branch ${i + 1}`);
    upd({ branches: clamped, branchLabels: next });
  };

  const updateBranchLabel = (i: number, label: string) => {
    const next = [...(data.branchLabels ?? [])];
    next[i] = label;
    upd({ branchLabels: next });
  };

  const isFork = data.mode === 'fork';

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className={labelClass}>Node Title</label>
        <input
          className={inputClass}
          value={data.title}
          onChange={e => upd({ title: e.target.value })}
          placeholder={isFork ? 'e.g., IT & Facilities Parallel' : 'e.g., Wait for All Paths'}
        />
      </div>

      {/* Mode toggle */}
      <div>
        <label className={labelClass}>Node Mode</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => upd({ mode: 'fork' })}
            className={`flex items-center justify-center gap-2 text-xs font-semibold py-2.5 rounded-lg border transition-all ${
              isFork
                ? 'bg-pink-500/20 border-pink-500/40 text-pink-300 ring-1 ring-pink-500/40'
                : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
            }`}
          >
            <GitFork size={12} /> Fork
          </button>
          <button
            type="button"
            onClick={() => upd({ mode: 'join' })}
            className={`flex items-center justify-center gap-2 text-xs font-semibold py-2.5 rounded-lg border transition-all ${
              !isFork
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 ring-1 ring-emerald-500/40'
                : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
            }`}
          >
            <Merge size={12} /> Join
          </button>
        </div>
        <p className="text-[10px] text-white/30 mt-1.5">
          {isFork
            ? 'Fork splits the workflow into parallel branches that run simultaneously.'
            : 'Join waits for all incoming branches to complete before continuing.'}
        </p>
      </div>

      {/* Branch count — only relevant for Fork */}
      {isFork && (
        <>
          <div>
            <label className={labelClass}>
              Number of Branches: <span className="text-pink-300 font-mono">{data.branches}</span>
            </label>
            <input
              type="range"
              min={2}
              max={8}
              step={1}
              value={data.branches}
              onChange={e => setBranches(parseInt(e.target.value, 10))}
              className="w-full accent-pink-500"
            />
            <div className="flex justify-between text-[10px] text-white/30 mt-0.5">
              <span>2</span>
              <span>4</span>
              <span>6</span>
              <span>8</span>
            </div>
          </div>

          {/* Branch labels */}
          <div className="space-y-2">
            <label className={labelClass}>Branch Labels</label>
            <div className="space-y-1.5">
              {Array.from({ length: data.branches }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-pink-300 font-mono w-5 text-center">{i + 1}</span>
                  <input
                    className="flex-1 text-xs border border-pink-500/20 bg-pink-500/5 text-white placeholder-white/30 rounded px-2 py-1.5 focus:ring-1 ring-pink-500 outline-none"
                    value={data.branchLabels?.[i] ?? `Branch ${i + 1}`}
                    onChange={e => updateBranchLabel(i, e.target.value)}
                    placeholder={`Branch ${i + 1} label`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-pink-500/20 bg-pink-500/5 p-3">
            <p className="text-[10px] text-pink-300/80 leading-relaxed">
              💡 Connect each branch handle (at the bottom of the Fork node) to a separate downstream node. A <strong>Join</strong> node can be placed at the end to wait for all paths to complete.
            </p>
          </div>
        </>
      )}

      {!isFork && (
        <div>
          <label className={labelClass}>
            Expecting Branches: <span className="text-emerald-300 font-mono">{data.branches}</span>
          </label>
          <input
            type="range"
            min={2}
            max={8}
            step={1}
            value={data.branches}
            onChange={e => upd({ branches: parseInt(e.target.value, 10) })}
            className="w-full accent-emerald-500"
          />
          <p className="text-[10px] text-white/30 mt-1.5">
            The Join node will wait until all {data.branches} incoming paths have finished before proceeding.
          </p>
        </div>
      )}
    </div>
  );
}
