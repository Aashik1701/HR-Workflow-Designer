import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  type Connection,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useWorkflowStore } from '../../store/workflowStore';
import { StartNode } from '../nodes/StartNode';
import { TaskNode } from '../nodes/TaskNode';
import { ApprovalNode } from '../nodes/ApprovalNode';
import { AutomatedStepNode } from '../nodes/AutomatedStepNode';
import { EndNode } from '../nodes/EndNode';
import { getDefaultNodeData } from '../../utils/nodeDefaults';
import type { NodeType } from '../../types/workflow';

// Register custom node types — must be defined outside component to avoid re-creation
const nodeTypes = {
  startNode: StartNode,
  taskNode: TaskNode,
  approvalNode: ApprovalNode,
  automatedStepNode: AutomatedStepNode,
  endNode: EndNode,
};

export function WorkflowCanvas() {
  const {
    nodes, edges,
    setNodes, setEdges,
    onNodesChange, onEdgesChange,
    setSelectedNodeId,
  } = useWorkflowStore();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onConnect = useCallback(
    (connection: Connection) => setEdges(addEdge({ ...connection, animated: true }, edges)),
    [edges, setEdges]
  );

  // Handle drop from sidebar
  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow-type') as NodeType;
      if (!type || !reactFlowWrapper.current) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = {
        x: event.clientX - bounds.left - 112,
        y: event.clientY - bounds.top - 40,
      };

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: getDefaultNodeData(type),
      };

      setNodes([...nodes, newNode]);
    },
    [nodes, setNodes]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: { id: string }) => setSelectedNodeId(node.id),
    [setSelectedNodeId]
  );

  const onPaneClick = useCallback(() => setSelectedNodeId(null), [setSelectedNodeId]);

  return (
    <div ref={reactFlowWrapper} className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{
          animated: true,
          style: { strokeWidth: 2, stroke: '#6366f1' },
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} color="#e2e8f0" />
        <Controls className="!shadow-md" />
        <MiniMap
          nodeColor={(node) => {
            const colors: Record<string, string> = {
              startNode: '#10b981',
              taskNode: '#3b82f6',
              approvalNode: '#f59e0b',
              automatedStepNode: '#8b5cf6',
              endNode: '#f43f5e',
            };
            return colors[node.type ?? ''] ?? '#94a3b8';
          }}
          className="!rounded-xl !shadow-md"
        />
      </ReactFlow>
    </div>
  );
}
