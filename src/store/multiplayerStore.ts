import { create } from 'zustand';

export interface Collaborator {
  id: string;
  name: string;
  color: string;
  selectedNodeId: string | null;
}

export interface CursorPosition {
  x: number;
  y: number;
}

interface MultiplayerStore {
  collaborators: Record<string, Collaborator>;
  cursors: Record<string, CursorPosition>;
  setCollaborators: (collaborators: Record<string, Collaborator>) => void;
  setCursors: (updater: Record<string, CursorPosition> | ((prev: Record<string, CursorPosition>) => Record<string, CursorPosition>)) => void;
  removeCursor: (id: string) => void;
}

export const useMultiplayerStore = create<MultiplayerStore>((set) => ({
  collaborators: {},
  cursors: {},
  setCollaborators: (collaborators) => set({ collaborators }),
  setCursors: (updater) => set((state) => ({
    cursors: typeof updater === 'function' ? updater(state.cursors) : updater
  })),
  removeCursor: (id) => set((state) => {
    const next = { ...state.cursors };
    delete next[id];
    return { cursors: next };
  }),
}));
