import { useWorkflowStore } from '../../store/workflowStore';
import { StartNodeForm } from './StartNodeForm';
import { TaskNodeForm } from './TaskNodeForm';
import { ApprovalNodeForm } from './ApprovalNodeForm';
import { AutomatedStepNodeForm } from './AutomatedStepNodeForm';
import { SplitNodeForm } from './SplitNodeForm';
import { DelayNodeForm } from './DelayNodeForm';
import { EndNodeForm } from './EndNodeForm';
import { SlidersHorizontal } from 'lucide-react';
import clsx from 'clsx';

interface NodeFormPanelProps {
  dark?: boolean;
}

export function NodeFormPanel({ dark }: NodeFormPanelProps) {
  const { nodes, selectedNodeId } = useWorkflowStore();
  const node = nodes.find(n => n.id === selectedNodeId);

  if (!node) {
    return (
      <div className={clsx('flex flex-col items-center justify-center h-full gap-2', dark ? 'text-white/30' : 'text-white/40')}>
        <SlidersHorizontal size={24} strokeWidth={1} />
        <p className="text-xs text-center">Select a node to configure it</p>
      </div>
    );
  }

  const formMap: Record<string, React.ReactNode> = {
    startNode:         <StartNodeForm nodeId={node.id} data={node.data as never} />,
    taskNode:          <TaskNodeForm nodeId={node.id} data={node.data as never} />,
    approvalNode:      <ApprovalNodeForm nodeId={node.id} data={node.data as never} />,
    automatedStepNode: <AutomatedStepNodeForm nodeId={node.id} data={node.data as never} />,
    splitNode:         <SplitNodeForm nodeId={node.id} data={node.data as never} />,
    delayNode:         <DelayNodeForm nodeId={node.id} data={node.data as never} />,
    endNode:           <EndNodeForm nodeId={node.id} data={node.data as never} />,
  };

  return (
    <div className={clsx('p-4 space-y-4', dark && 'text-white')}>
      <h2 className={clsx('text-sm font-semibold capitalize', dark ? 'text-white' : 'text-slate-700')}>
        {node.type?.replace(/([A-Z])/g, ' $1').trim()} Properties
      </h2>
      {formMap[node.type as string] ?? (
        <p className={clsx('text-xs', dark ? 'text-white/30' : 'text-white/40')}>Unknown node type</p>
      )}
    </div>
  );
}
