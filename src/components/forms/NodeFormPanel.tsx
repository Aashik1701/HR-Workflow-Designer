import { useWorkflowStore } from '../../store/workflowStore';
import { StartNodeForm } from './StartNodeForm';
import { TaskNodeForm } from './TaskNodeForm';
import { ApprovalNodeForm } from './ApprovalNodeForm';
import { AutomatedStepNodeForm } from './AutomatedStepNodeForm';
import { EndNodeForm } from './EndNodeForm';
import { SlidersHorizontal } from 'lucide-react';

export function NodeFormPanel() {
  const { nodes, selectedNodeId } = useWorkflowStore();
  const node = nodes.find(n => n.id === selectedNodeId);

  if (!node) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
        <SlidersHorizontal size={24} strokeWidth={1} />
        <p className="text-xs text-center">Select a node to configure it</p>
      </div>
    );
  }

  const formMap: Record<string, React.ReactNode> = {
    startNode:        <StartNodeForm nodeId={node.id} data={node.data as never} />,
    taskNode:         <TaskNodeForm nodeId={node.id} data={node.data as never} />,
    approvalNode:     <ApprovalNodeForm nodeId={node.id} data={node.data as never} />,
    automatedStepNode:<AutomatedStepNodeForm nodeId={node.id} data={node.data as never} />,
    endNode:          <EndNodeForm nodeId={node.id} data={node.data as never} />,
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-sm font-semibold text-slate-700 capitalize">
        {node.type?.replace(/([A-Z])/g, ' $1').trim()} Properties
      </h2>
      {formMap[node.type as string] ?? <p className="text-xs text-slate-400">Unknown node type</p>}
    </div>
  );
}
