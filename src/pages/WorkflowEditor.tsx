import { useParams, useNavigate } from 'react-router-dom';
import { useWorkflow } from '../hooks/useWorkflow';
import { ReactFlowProvider } from '@xyflow/react';
import { WorkflowCanvas } from '../components/canvas/WorkflowCanvas';
import { NodeSidebar } from '../components/canvas/NodeSidebar';
import { NodeFormPanel } from '../components/forms/NodeFormPanel';
import { SimulationPanel } from '../components/simulation/SimulationPanel';
import { useMemo, useState } from 'react';
import { ChevronLeft, Save, Loader2, AlertCircle, UploadCloud, RotateCcw, History } from 'lucide-react';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { useMultiplayer } from '../hooks/useMultiplayer';
import { PresenceAvatars } from '../components/multiplayer/PresenceAvatars';

export function WorkflowEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    workflow,
    versions,
    versionsLoading,
    saving,
    publishing,
    rollbackingVersionId,
    save,
    publish,
    rollbackToVersion,
    loadError,
  } = useWorkflow(id!);
  const [panel, setPanel] = useState<'properties' | 'simulation' | 'history'>('properties');
  const [releaseNote, setReleaseNote] = useState('');

  // Start multiplayer session
  useMultiplayer(id);

  const nextVersion = useMemo(() => (versions[0]?.version_number ?? 0) + 1, [versions]);

  const handlePublish = async () => {
    await publish(releaseNote.trim());
    setReleaseNote('');
    setPanel('history');
  };

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3 text-white/40">
          <AlertCircle size={32} strokeWidth={1} className="text-red-400/60" />
          <p className="text-sm">Workflow not found or failed to load.</p>
          <button onClick={() => navigate('/workflows')} className="text-xs text-blue-400 hover:underline">
            Back to Workflows
          </button>
        </div>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <div className="h-full flex flex-col bg-[#0f0f1a]">
        <div className="h-14 border-b border-white/5 flex items-center px-4 gap-3 flex-shrink-0 bg-[#0d0d18]">
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
          <div className="ml-auto flex items-center gap-4">
            <PresenceAvatars />
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <input
              value={releaseNote}
              onChange={(event) => setReleaseNote(event.target.value)}
              placeholder="Release note for changelog"
              className="w-56 rounded-md border border-white/10 bg-[#0f0f1a] px-2.5 py-1.5 text-xs text-white/80 placeholder:text-white/30 outline-none focus:border-blue-500/40"
            />
            {(['properties', 'simulation'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPanel(p)}
                className={clsx(
                  'text-xs px-3 py-1.5 rounded-md font-medium capitalize transition-colors',
                  panel === p ? 'bg-blue-600 text-white' : 'text-white/40 hover:bg-white/5'
                )}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPanel('history')}
              className={clsx(
                'text-xs px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5',
                panel === 'history' ? 'bg-blue-600 text-white' : 'text-white/40 hover:bg-white/5'
              )}
            >
              <History size={12} />
              History
            </button>
            <button
              onClick={save}
              disabled={saving || !workflow}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handlePublish}
              disabled={publishing || !workflow}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
            >
              {publishing ? <Loader2 size={12} className="animate-spin" /> : <UploadCloud size={12} />}
              {publishing ? 'Publishing...' : `Publish v${nextVersion}`}
            </button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <NodeSidebar dark />
          <main className="flex-1 relative">
            <WorkflowCanvas dark />
          </main>
          <aside className="w-72 border-l border-white/5 bg-[#0d0d18] overflow-y-auto flex-shrink-0">
            {panel === 'properties' && <NodeFormPanel dark />}
            {panel === 'simulation' && <SimulationPanel workflowId={id} dark />}
            {panel === 'history' && (
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-white">Release History</h3>
                  <p className="text-xs text-white/40">Published versions and rollback points</p>
                </div>

                {versionsLoading ? (
                  <div className="text-xs text-white/35">Loading release history...</div>
                ) : versions.length === 0 ? (
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-white/45">
                    No releases yet. Publish this draft to create v1.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {versions.map((version) => (
                      <div key={version.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-white">v{version.version_number}</span>
                          <span className="text-[10px] text-white/35">
                            {formatDistanceToNow(new Date(version.published_at ?? version.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-white/55 line-clamp-2">
                          {version.change_note || 'No changelog note provided'}
                        </p>
                        <button
                          onClick={() => rollbackToVersion(version)}
                          disabled={rollbackingVersionId === version.id}
                          className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-white/70 transition-colors hover:bg-white/10 disabled:opacity-50"
                        >
                          {rollbackingVersionId === version.id ? <Loader2 size={11} className="animate-spin" /> : <RotateCcw size={11} />}
                          {rollbackingVersionId === version.id ? 'Rolling back...' : `Rollback to v${version.version_number}`}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    </ReactFlowProvider>
  );
}
