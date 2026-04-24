import { Download, Upload, Trash2, CheckSquare } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { validateWorkflow } from '../../utils/graphValidator';
import toast from 'react-hot-toast';
import { useRef } from 'react';

export function CanvasToolbar() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const { nodes, edges } = useWorkflowStore.getState();
    if (nodes.length === 0) {
      toast.error('No workflow to export');
      return;
    }
    const blob = new Blob([JSON.stringify({ nodes, edges }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Workflow exported!');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const { nodes, edges } = JSON.parse(ev.target?.result as string);
        useWorkflowStore.getState().importWorkflow(nodes, edges);
        toast.success('Workflow imported!');
      } catch {
        toast.error('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    // Reset so the same file can be re-imported
    e.target.value = '';
  };

  const handleValidate = () => {
    const { nodes, edges } = useWorkflowStore.getState();
    const result = validateWorkflow(nodes, edges);
    if (result.isValid) {
      toast.success('Workflow is valid! ✓');
    } else {
      result.errors.forEach((err) => toast.error(err.message));
    }
  };

  const handleClear = () => {
    useWorkflowStore.getState().clearWorkflow();
    toast.success('Canvas cleared');
  };

  const btnClass =
    'flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 px-2 py-1.5 rounded-md hover:bg-slate-100 transition-colors';

  return (
    <div className="flex items-center gap-1 ml-4">
      <button onClick={handleValidate} className={btnClass} title="Validate workflow">
        <CheckSquare size={13} /> Validate
      </button>
      <button onClick={handleExport} className={btnClass} title="Export as JSON">
        <Download size={13} /> Export
      </button>
      <button onClick={() => fileInputRef.current?.click()} className={btnClass} title="Import JSON">
        <Upload size={13} /> Import
      </button>
      <button onClick={handleClear} className={`${btnClass} hover:!text-red-600`} title="Clear canvas">
        <Trash2 size={13} /> Clear
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />
    </div>
  );
}
