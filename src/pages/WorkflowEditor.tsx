import { useParams, useNavigate } from 'react-router-dom';
import { useWorkflow } from '../hooks/useWorkflow';
import { ReactFlowProvider } from '@xyflow/react';
import { WorkflowCanvas } from '../components/canvas/WorkflowCanvas';
import { NodeSidebar } from '../components/canvas/NodeSidebar';
import { NodeFormPanel } from '../components/forms/NodeFormPanel';
import { SimulationPanel } from '../components/simulation/SimulationPanel';
import { useState } from 'react';
import { ChevronLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

export function WorkflowEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { workflow, saving, save, loadError } = useWorkflow(id!);
  const [panel, setPanel] = useState<'properties' | 'simulation'>('properties');

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3 text-white/40">
          <AlertCircle size={32} strokeWidth={1} className="text-red-400/60" />
          <p className="text-sm">Workflow not found or failed to load.</p>
          <button onClick={() => navigate('/workflows')} className="text-xs text-violet-400 hover:underline">
            Back to Workflows
          </button>
        </div>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <div className="h-full flex flex-col bg-[#0f0f1a]">
        <div className="h-12 border-b border-white/5 flex items-center px-4 gap-3 flex-shrink-0 bg-[#0d0d18]">
          <button onClick={() => navigate('/workflows')} className="flex items-center gap-1 text-xs text-white/40 hover:text-white transition-colors">
            <ChevronLeft size={14} /> Workflows
          </button>
          <div className="w-px h-4 bg-white/10" />
          <span className="text-sm font-medium text-white truncate max-w-xs">
            {workflow?.name ?? <span className="text-white/30">Loading...</span>}
          </span>
          {workflow?.status && (
            <span className={clsx(
              'text-[10px] px-2 py-0.5 rounded-full border font-medium',
              workflow.status === 'active'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-white/5 border-white/10 text-white/40'
            )}>
              {workflow.status === 'active' ? '● Active' : '● Draft'}
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            {(['properties', 'simulation'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPanel(p)}
                className={clsx(
                  'text-xs px-3 py-1.5 rounded-md font-medium capitalize transition-colors',
                  panel === p ? 'bg-violet-600 text-white' : 'text-white/40 hover:bg-white/5'
                )}
              >
                {p}
              </button>
            ))}
            <button
              onClick={save}
              disabled={saving || !workflow}
              className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <NodeSidebar dark />
          <main className="flex-1 relative">
            <WorkflowCanvas dark />
          </main>
          <aside className="w-72 border-l border-white/5 bg-[#0d0d18] overflow-y-auto flex-shrink-0">
            {panel === 'properties' ? <NodeFormPanel dark /> : <SimulationPanel workflowId={id} dark />}
          </aside>
        </div>
      </div>
    </ReactFlowProvider>
  );
}
