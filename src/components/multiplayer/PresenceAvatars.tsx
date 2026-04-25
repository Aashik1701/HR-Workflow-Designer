import React from 'react';
import { useMultiplayerStore } from '../../store/multiplayerStore';
import { me } from '../../hooks/useMultiplayer';

export function PresenceAvatars() {
  const collaborators = useMultiplayerStore((s) => s.collaborators);
  const activeUsers = Object.values(collaborators);

  // Filter out ourselves just in case, though the presence hook tracks everyone including us.
  const others = activeUsers.filter(u => u.id !== me.id);

  if (others.length === 0) return null;

  return (
    <div className="flex items-center">
      {others.map((user, i) => {
        // get initials
        const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        
        return (
          <div
            key={user.id}
            title={`${user.name} (Online)`}
            className="relative flex h-7 w-7 items-center justify-center rounded-full border border-[#0d0d18] text-[10px] font-bold text-white shadow-sm transition-transform hover:scale-110 hover:z-10"
            style={{
              backgroundColor: user.color,
              marginLeft: i > 0 ? -8 : 0,
              zIndex: 10 - i, // ensure overlapping correctly
            }}
          >
            {initials}
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0d0d18] bg-emerald-500" />
          </div>
        );
      })}
    </div>
  );
}
