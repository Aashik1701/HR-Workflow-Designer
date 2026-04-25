import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useWorkflowStore } from '../store/workflowStore';
import { useMultiplayerStore, type Collaborator } from '../store/multiplayerStore';

const COLORS = [
  '#f43f5e', '#f97316', '#f59e0b', '#84cc16', '#10b981', 
  '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', 
  '#8b5cf6', '#d946ef'
];

function generateGuestIdentity() {
  const rand = Math.floor(Math.random() * 1000);
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  return {
    id: `guest-${rand}-${Date.now()}`,
    name: `Guest ${rand}`,
    color,
    selectedNodeId: null
  };
}

let cachedIdentity = sessionStorage.getItem('multiplayer_identity');
if (!cachedIdentity) {
  cachedIdentity = JSON.stringify(generateGuestIdentity());
  sessionStorage.setItem('multiplayer_identity', cachedIdentity);
}
export const me = JSON.parse(cachedIdentity) as Collaborator;

export function useMultiplayer(workflowId: string | undefined) {
  const selectedNodeId = useWorkflowStore(s => s.selectedNodeId);
  const { setCollaborators, setCursors, removeCursor } = useMultiplayerStore();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!workflowId) return;

    const channelName = `workflow:${workflowId}`;
    
    // Ensure no lingering channel exists from React Strict Mode unmount/remount
    const existingChannel = supabase.getChannels().find(c => c.topic === `realtime:${channelName}`);
    if (existingChannel) {
      supabase.removeChannel(existingChannel);
    }

    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: me.id,
        },
        broadcast: { ack: false },
      },
    });

    channelRef.current = channel;

    try {
      if (channel.state === 'closed') {
        channel
          .on('presence', { event: 'sync' }, () => {
            const state = channel.presenceState<Collaborator>();
            const newState: Record<string, Collaborator> = {};
            for (const key in state) {
              if (state[key] && state[key].length > 0) {
                newState[key] = state[key][0];
              }
            }
            setCollaborators(newState);
          })
          .on('presence', { event: 'leave' }, ({ key }) => {
            removeCursor(key);
          })
          .on('broadcast', { event: 'cursor_move' }, ({ payload }) => {
            if (payload.id !== me.id) {
              setCursors(prev => ({
                ...prev,
                [payload.id]: { x: payload.x, y: payload.y }
              }));
            }
          })
          .on('broadcast', { event: 'viewport_move' }, ({ payload }) => {
            if (payload.id !== me.id) {
              useMultiplayerStore.getState().setViewports(prev => ({
                ...prev,
                [payload.id]: { x: payload.x, y: payload.y, zoom: payload.zoom }
              }));
            }
          })
          .on('broadcast', { event: 'ping' }, ({ payload }) => {
            if (payload.id !== me.id) {
              useMultiplayerStore.getState().addPing(payload.ping);
            }
          })
          .on('broadcast', { event: 'comment_thread' }, ({ payload }) => {
            if (payload.id !== me.id) {
              useMultiplayerStore.getState().addCommentThread(payload.thread);
            }
          })
          .on('broadcast', { event: 'comment_message' }, ({ payload }) => {
            if (payload.id !== me.id) {
              useMultiplayerStore.getState().addCommentMessage(payload.threadId, payload.message);
            }
          })
          .on('broadcast', { event: 'comment_resolve' }, ({ payload }) => {
            if (payload.id !== me.id) {
              useMultiplayerStore.getState().resolveCommentThread(payload.threadId);
            }
          })
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              await channel.track({
                ...me,
                selectedNodeId
              });
            }
          });
      }
    } catch (e) {
      console.warn('Supabase realtime strict mode race condition caught:', e);
    }

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
      setCollaborators({});
      setCursors({});
      // Don't reset viewports/comments immediately to prevent jarring flashes on HMR
    };
  }, [workflowId, setCollaborators, setCursors, removeCursor]);

  // When selected node changes, update our presence state
  useEffect(() => {
    if (channelRef.current && channelRef.current.state === 'joined') {
      channelRef.current.track({
        ...me,
        selectedNodeId
      });
    }
  }, [selectedNodeId]);

  const broadcastCursor = useCallback((x: number, y: number) => {
    if (channelRef.current && channelRef.current.state === 'joined') {
      channelRef.current.send({
        type: 'broadcast',
        event: 'cursor_move',
        payload: { id: me.id, x, y }
      });
    }
  }, []);

  const broadcastViewport = useCallback((x: number, y: number, zoom: number) => {
    if (channelRef.current && channelRef.current.state === 'joined') {
      channelRef.current.send({
        type: 'broadcast',
        event: 'viewport_move',
        payload: { id: me.id, x, y, zoom }
      });
    }
  }, []);

  const broadcastPing = useCallback((ping: any) => {
    if (channelRef.current && channelRef.current.state === 'joined') {
      channelRef.current.send({
        type: 'broadcast',
        event: 'ping',
        payload: { id: me.id, ping }
      });
    }
  }, []);

  const broadcastCommentThread = useCallback((thread: any) => {
    if (channelRef.current && channelRef.current.state === 'joined') {
      channelRef.current.send({
        type: 'broadcast',
        event: 'comment_thread',
        payload: { id: me.id, thread }
      });
    }
  }, []);

  const broadcastCommentMessage = useCallback((threadId: string, message: any) => {
    if (channelRef.current && channelRef.current.state === 'joined') {
      channelRef.current.send({
        type: 'broadcast',
        event: 'comment_message',
        payload: { id: me.id, threadId, message }
      });
    }
  }, []);

  const broadcastCommentResolve = useCallback((threadId: string) => {
    if (channelRef.current && channelRef.current.state === 'joined') {
      channelRef.current.send({
        type: 'broadcast',
        event: 'comment_resolve',
        payload: { id: me.id, threadId }
      });
    }
  }, []);

  return {
    broadcastCursor,
    broadcastViewport,
    broadcastPing,
    broadcastCommentThread,
    broadcastCommentMessage,
    broadcastCommentResolve
  };
}
