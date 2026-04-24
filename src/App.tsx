import { Toaster } from 'react-hot-toast';
import { ReactFlowProvider } from '@xyflow/react';
import { NodeSidebar } from './components/canvas/NodeSidebar';
import { WorkflowCanvas } from './components/canvas/WorkflowCanvas';
import { NodeFormPanel } from './components/forms/NodeFormPanel';
import { SimulationPanel } from './components/simulation/SimulationPanel';
import { CanvasToolbar } from './components/canvas/CanvasToolbar';
import { useState } from 'react';

type RightPanel = 'properties' | 'simulation';

export default function App() {
  const [rightPanel, setRightPanel] = useState<RightPanel>('properties');

  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen bg-slate-50 flex flex-col overflow-hidden font-sans">
        {/* Top Bar */}
        <header className="h-12 border-b border-slate-200 bg-white flex items-center px-4 gap-4 flex-shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v18M3 12h18" />
              </svg>
            </div>
            <span className="font-semibold text-slate-800 text-sm">HR Workflow Designer</span>
          </div>
          <CanvasToolbar />
          <div className="ml-auto flex gap-1 text-xs">
            {(['properties', 'simulation'] as RightPanel[]).map(p => (
              <button
                key={p}
                onClick={() => setRightPanel(p)}
                className={`px-3 py-1.5 rounded-md font-medium capitalize transition-colors ${
                  rightPanel === p
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </header>

        {/* Main Layout */}
        <div className="flex flex-1 overflow-hidden">
          <NodeSidebar />
          <main className="flex-1 relative">
            <WorkflowCanvas />
          </main>
          <aside className="w-72 border-l border-slate-200 bg-white overflow-y-auto flex-shrink-0">
            {rightPanel === 'properties' ? <NodeFormPanel /> : <SimulationPanel />}
          </aside>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </ReactFlowProvider>
  );
}
