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

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface Ping {
  id: string;
  x: number;
  y: number;
  color: string;
  createdAt: number;
}

export interface CommentMessage {
  id: string;
  authorId: string;
  authorName: string;
  authorColor: string;
  text: string;
  timestamp: number;
}

export interface CommentThread {
  id: string;
  x: number;
  y: number;
  messages: CommentMessage[];
  resolved: boolean;
}

interface MultiplayerStore {
  collaborators: Record<string, Collaborator>;
  cursors: Record<string, CursorPosition>;
  followingUserId: string | null;
  viewports: Record<string, Viewport>;
  pings: Ping[];
  comments: Record<string, CommentThread>;
  activeCommentThreadId: string | null;

  setCollaborators: (collaborators: Record<string, Collaborator>) => void;
  setCursors: (updater: Record<string, CursorPosition> | ((prev: Record<string, CursorPosition>) => Record<string, CursorPosition>)) => void;
  removeCursor: (id: string) => void;
  
  setFollowingUserId: (id: string | null) => void;
  setViewports: (updater: Record<string, Viewport> | ((prev: Record<string, Viewport>) => Record<string, Viewport>)) => void;
  
  addPing: (ping: Ping) => void;
  removePing: (id: string) => void;
  
  setActiveCommentThreadId: (id: string | null) => void;
  addCommentThread: (thread: CommentThread) => void;
  addCommentMessage: (threadId: string, message: CommentMessage) => void;
  resolveCommentThread: (threadId: string) => void;
}

export const useMultiplayerStore = create<MultiplayerStore>((set) => ({
  collaborators: {},
  cursors: {},
  followingUserId: null,
  viewports: {},
  pings: [],
  comments: {},
  activeCommentThreadId: null,

  setCollaborators: (collaborators) => set({ collaborators }),
  setCursors: (updater) => set((state) => ({
    cursors: typeof updater === 'function' ? updater(state.cursors) : updater
  })),
  removeCursor: (id) => set((state) => {
    const next = { ...state.cursors };
    delete next[id];
    return { cursors: next };
  }),

  setFollowingUserId: (id) => set({ followingUserId: id }),
  setViewports: (updater) => set((state) => ({
    viewports: typeof updater === 'function' ? updater(state.viewports) : updater
  })),

  addPing: (ping) => set((state) => ({
    pings: [...state.pings, ping]
  })),
  removePing: (id) => set((state) => ({
    pings: state.pings.filter(p => p.id !== id)
  })),

  setActiveCommentThreadId: (id) => set({ activeCommentThreadId: id }),
  addCommentThread: (thread) => set((state) => ({
    comments: { ...state.comments, [thread.id]: thread }
  })),
  addCommentMessage: (threadId, message) => set((state) => {
    const thread = state.comments[threadId];
    if (!thread) return state;
    return {
      comments: {
        ...state.comments,
        [threadId]: {
          ...thread,
          messages: [...thread.messages, message]
        }
      }
    };
  }),
  resolveCommentThread: (threadId) => set((state) => {
    const thread = state.comments[threadId];
    if (!thread) return state;
    return {
      comments: {
        ...state.comments,
        [threadId]: { ...thread, resolved: true }
      }
    };
  }),
}));
