import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  type Connection,
  BackgroundVariant,
  useReactFlow,
  useOnViewportChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useWorkflowStore } from '../../store/workflowStore';
import { useParams } from 'react-router-dom';
import { useMultiplayer, me } from '../../hooks/useMultiplayer';
import { useMultiplayerStore } from '../../store/multiplayerStore';
import { LiveCursors } from '../multiplayer/LiveCursors';
import { LivePings } from '../multiplayer/LivePings';
import { CommentPins } from '../multiplayer/CommentPins';
import { CommentPanel } from '../multiplayer/CommentPanel';
import { AICopilot } from './AICopilot';
import { StartNode } from '../nodes/StartNode';
import { TaskNode } from '../nodes/TaskNode';
import { ApprovalNode } from '../nodes/ApprovalNode';
import { AutomatedStepNode } from '../nodes/AutomatedStepNode';
import { SplitNode } from '../nodes/SplitNode';
import { DelayNode } from '../nodes/DelayNode';
import { EndNode } from '../nodes/EndNode';
import { WebhookNode } from '../nodes/WebhookNode';
import { AIActionNode } from '../nodes/AIActionNode';
import { ForkNode } from '../nodes/ForkNode';
import { LoopNode } from '../nodes/LoopNode';
import { DocumentGenNode } from '../nodes/DocumentGenNode';
import { getDefaultNodeData } from '../../utils/nodeDefaults';
import type { NodeType, WorkflowNode } from '../../types/workflow';

const nodeTypes = {
  startNode: StartNode,
  taskNode: TaskNode,
  approvalNode: ApprovalNode,
  automatedStepNode: AutomatedStepNode,
  splitNode: SplitNode,
  delayNode: DelayNode,
  endNode: EndNode,
  webhookNode: WebhookNode,
  aiActionNode: AIActionNode,
  forkNode: ForkNode,
  loopNode: LoopNode,
  documentGenNode: DocumentGenNode,
};

interface WorkflowCanvasProps {
  dark?: boolean;
}

export function WorkflowCanvas({ dark }: WorkflowCanvasProps) {
  const {
    nodes, edges,
    setNodes, setEdges,
    onNodesChange, onEdgesChange,
    setSelectedNodeId,
  } = useWorkflowStore();
  const { id } = useParams<{ id: string }>();
  const { broadcastCursor, broadcastViewport, broadcastPing } = useMultiplayer(id);
  const followingUserId = useMultiplayerStore((s) => s.followingUserId);
  const setFollowingUserId = useMultiplayerStore((s) => s.setFollowingUserId);
  const viewports = useMultiplayerStore((s) => s.viewports);
  const addPing = useMultiplayerStore((s) => s.addPing);
  const addCommentThread = useMultiplayerStore((s) => s.addCommentThread);
  const setActiveCommentThreadId = useMultiplayerStore((s) => s.setActiveCommentThreadId);
  const { screenToFlowPosition, setViewport } = useReactFlow();

  // Global pointer tracking ensures cursors are visible even when hovering over nodes or overlays
  const lastBroadcast = useRef(0);
  
  React.useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const now = Date.now();
      if (now - lastBroadcast.current > 50) { // ~20fps broadcast
        try {
          // screenToFlowPosition might throw if ReactFlow isn't fully initialized
          const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
          broadcastCursor(position.x, position.y);
          lastBroadcast.current = now;
        } catch (err) {
          // Ignore if canvas isn't ready
        }
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [screenToFlowPosition, broadcastCursor]);

  // Broadcast viewport changes, but ONLY if we are NOT currently following someone else
  useOnViewportChange({
    onChange: (viewport) => {
      if (!followingUserId) {
        broadcastViewport(viewport.x, viewport.y, viewport.zoom);
      }
    },
  });

  // Automatically sync our viewport if we are following someone
  React.useEffect(() => {
    if (followingUserId && viewports[followingUserId]) {
      setViewport(viewports[followingUserId]);
    }
  }, [followingUserId, viewports, setViewport]);

  const handlePing = useCallback((e: React.MouseEvent) => {
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const pingId = `ping-${Date.now()}-${Math.random()}`;
    const ping = { id: pingId, x: position.x, y: position.y, color: me.color, createdAt: Date.now() };
    addPing(ping);
    broadcastPing(ping);
  }, [screenToFlowPosition, addPing, broadcastPing]);

  const { broadcastCommentThread } = useMultiplayer(id);
  
  const handleCommentDrop = useCallback((e: React.MouseEvent) => {
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const threadId = `thread-${Date.now()}-${Math.random()}`;
    const thread = {
      id: threadId,
      x: position.x,
      y: position.y,
      messages: [],
      resolved: false
    };
    addCommentThread(thread);
    broadcastCommentThread(thread);
    setActiveCommentThreadId(threadId);
  }, [screenToFlowPosition, addCommentThread, broadcastCommentThread, setActiveCommentThreadId]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((currentEdges) => addEdge({ ...connection, animated: true }, currentEdges));
    },
    [setEdges]
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow-type') as NodeType;
      if (!type) return;

      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });

      const nodeId =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? `${type}-${crypto.randomUUID()}`
          : `${type}-${Date.now()}`;

      const newNode: WorkflowNode = {
        id: nodeId,
        type,
        position,
        data: getDefaultNodeData(type),
      };

      setNodes((currentNodes) => [...currentNodes, newNode]);
    },
    [screenToFlowPosition, setNodes]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onNodeClick = useCallback(
    (e: React.MouseEvent, node: { id: string }) => {
      if (e.altKey) {
        handlePing(e);
        return;
      }
      if (e.shiftKey) {
        handleCommentDrop(e);
        return;
      }
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId, handlePing, handleCommentDrop]
  );

  const onPaneClick = useCallback((e: React.MouseEvent) => {
    if (e.altKey) {
      handlePing(e);
      return;
    }
    if (e.shiftKey) {
      handleCommentDrop(e);
      return;
    }
    setSelectedNodeId(null);
  }, [setSelectedNodeId, handlePing, handleCommentDrop]);

  const onMoveStart = useCallback((e: MouseEvent | TouchEvent, viewport: any) => {
    // If the user manually starts dragging the pane or zooming, break the follow
    if (followingUserId) {
      setFollowingUserId(null);
    }
  }, [followingUserId, setFollowingUserId]);

  return (
    <div className="h-full w-full relative">
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
        onMoveStart={onMoveStart}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{
          animated: true,
          style: { strokeWidth: 2, stroke: dark ? '#8b5cf6' : '#6366f1' },
        }}
        style={dark ? { background: '#06061a' } : undefined}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.5}
          color={dark ? '#ffffff22' : '#e2e8f0'}
        />
        <Controls className="!shadow-md" />
        <MiniMap
          nodeColor={(node) => {
            const colors: Record<string, string> = {
              startNode: '#10b981',
              taskNode: '#3b82f6',
              approvalNode: '#f59e0b',
              automatedStepNode: '#8b5cf6',
              splitNode: '#06b6d4',
              delayNode: '#475569',
              endNode: '#f43f5e',
              webhookNode: '#f97316',
              aiActionNode: '#8b5cf6',
              forkNode: '#ec4899',
              loopNode: '#eab308',
              documentGenNode: '#06b6d4',
            };
            return colors[node.type ?? ''] ?? '#94a3b8';
          }}
          style={dark ? { background: '#1a1a2e', borderColor: '#ffffff10' } : undefined}
          className="!rounded-xl !shadow-md"
        />
        <LiveCursors />
        <AICopilot />
        <LivePings />
        <CommentPins />
      </ReactFlow>
      <CommentPanel />
    </div>
  );
}
