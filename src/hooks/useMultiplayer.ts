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
        payload: {
          id: me.id,
          x,
          y
        }
      });
    }
  }, []);

  return {
    broadcastCursor
  };
}
