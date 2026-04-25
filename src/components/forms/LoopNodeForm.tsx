import { Repeat, Hash, Variable } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import type { LoopNodeData } from '../../types/workflow';

interface Props { nodeId: string; data: LoopNodeData; }

const COMMON_SOURCES = [
  'candidates',
  'new_hires',
  'employees',
  'applicants',
  'tasks',
  'departments',
];

export function LoopNodeForm({ nodeId, data }: Props) {
  const { updateNodeData } = useWorkflowStore();

  const inputClass = "w-full text-xs border border-white/10 bg-[#12121a] text-white placeholder-white/30 rounded px-2 py-1.5 focus:ring-1 ring-yellow-500 outline-none";
  const labelClass = "block text-xs font-medium text-white/70 mb-1";

  const upd = (patch: Partial<LoopNodeData>) =>
    updateNodeData(nodeId, { ...data, ...patch });

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className={labelClass}>Node Title</label>
        <input
          className={inputClass}
          value={data.title}
          onChange={e => upd({ title: e.target.value })}
          placeholder="e.g., For Each New Hire"
        />
      </div>

      {/* Iterator Source */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-white/70 flex items-center gap-1.5">
            <Repeat size={11} className="text-yellow-400" />
            Iterator Source
          </label>
          <span className="text-[9px] text-yellow-400/70 font-mono bg-yellow-500/10 px-1.5 py-0.5 rounded">
            Supports {`{{ var }}`}
          </span>
        </div>
        <input
          className={inputClass}
          value={data.iteratorSource}
          onChange={e => upd({ iteratorSource: e.target.value })}
          placeholder="e.g., new_hires or {{ webhook.candidates }}"
        />
        {/* Quick-select suggestions */}
        <div className="flex flex-wrap gap-1 mt-1.5">
          {COMMON_SOURCES.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => upd({ iteratorSource: s })}
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                data.iteratorSource === s
                  ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300'
                  : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Current Item Variable */}
      <div>
        <label className={labelClass}>
          <span className="flex items-center gap-1.5">
            <Variable size={11} className="text-orange-400" />
            Current Item Variable
          </span>
        </label>
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-orange-400/70">{`{{ `}</span>
          <input
            className="w-full text-xs border border-white/10 bg-[#12121a] text-white placeholder-white/30 rounded px-2 py-1.5 pl-7 pr-8 focus:ring-1 ring-orange-500 outline-none font-mono"
            value={data.currentItemVariable}
            onChange={e => upd({ currentItemVariable: e.target.value })}
            placeholder="item"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-orange-400/70">{` }}`}</span>
        </div>
        <p className="text-[10px] text-white/30 mt-1">
          Each iteration, the current list element is accessible as{' '}
          <code className="text-orange-300/70 font-mono">{`{{ ${data.currentItemVariable || 'item'} }}`}</code> in child nodes.
        </p>
      </div>

      {/* Max Iterations */}
      <div>
        <label className={labelClass}>
          <span className="flex items-center gap-1.5">
            <Hash size={11} className="text-yellow-400" />
            Max Iterations (safety limit)
          </span>
        </label>
        <input
          type="number"
          min={1}
          max={10000}
          className={inputClass}
          value={data.maxIterations}
          onChange={e => upd({ maxIterations: Math.max(1, parseInt(e.target.value, 10) || 1) })}
        />
        <p className="text-[10px] text-white/30 mt-1">
          The loop stops automatically after {data.maxIterations} iterations, even if the list is longer.
        </p>
      </div>

      {/* Info box */}
      <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
        <p className="text-[10px] text-yellow-300/80 leading-relaxed">
          💡 Connect the Loop node's output to the first node of the repeated sequence. The loop will execute that entire sub-flow once per item in the <code className="font-mono">{data.iteratorSource || 'source'}</code> list.
        </p>
      </div>
    </div>
  );
}
