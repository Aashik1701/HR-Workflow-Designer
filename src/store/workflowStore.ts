import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react';
import type { WorkflowEdge, WorkflowNode, WorkflowNodeData } from '../types/workflow';

type NodesUpdater = WorkflowNode[] | ((current: WorkflowNode[]) => WorkflowNode[]);
type EdgesUpdater = WorkflowEdge[] | ((current: WorkflowEdge[]) => WorkflowEdge[]);

interface WorkflowStore {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;

  // Setters
  setNodes: (nodes: NodesUpdater) => void;
  setEdges: (edges: EdgesUpdater) => void;
  setSelectedNodeId: (id: string | null) => void;

  // React Flow change handlers
  onNodesChange: (changes: NodeChange<WorkflowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<WorkflowEdge>[]) => void;

  // Data mutation
  updateNodeData: (nodeId: string, data: WorkflowNodeData) => void;

  // Graph operations
  clearWorkflow: () => void;
  importWorkflow: (nodes: WorkflowNode[], edges: WorkflowEdge[]) => void;

  // Playback
  playbackNodeId: string | null;
  playbackStatus: 'running' | 'success' | 'error' | null;
  setPlaybackState: (id: string | null, status: 'running' | 'success' | 'error' | null) => void;
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,

  setNodes: (nextNodes) =>
    set((state) => ({
      nodes: typeof nextNodes === 'function' ? nextNodes(state.nodes) : nextNodes,
    })),
  setEdges: (nextEdges) =>
    set((state) => ({
      edges: typeof nextEdges === 'function' ? nextEdges(state.edges) : nextEdges,
    })),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  onNodesChange: (changes) =>
    set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) })),

  onEdgesChange: (changes) =>
    set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),

  updateNodeData: (nodeId, data) =>
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data } : n
      ),
    }),

  clearWorkflow: () => set({ nodes: [], edges: [], selectedNodeId: null, playbackNodeId: null, playbackStatus: null }),

  importWorkflow: (nodes, edges) => set({ nodes, edges, selectedNodeId: null, playbackNodeId: null, playbackStatus: null }),

  playbackNodeId: null,
  playbackStatus: null,
  setPlaybackState: (id, status) => set({ playbackNodeId: id, playbackStatus: status }),
}));
