import React from 'react';
import { useMultiplayerStore } from '../../store/multiplayerStore';
import { me } from '../../hooks/useMultiplayer';
import { Users } from 'lucide-react';

export function PresenceAvatars() {
  const collaborators = useMultiplayerStore((s) => s.collaborators);
  const activeUsers = Object.values(collaborators);

  // Filter out ourselves just in case, though the presence hook tracks everyone including us.
  const others = activeUsers.filter(u => u.id !== me.id);
  const followingUserId = useMultiplayerStore((s) => s.followingUserId);
  const setFollowingUserId = useMultiplayerStore((s) => s.setFollowingUserId);
  const [showDropdown, setShowDropdown] = React.useState(false);

  // We show all users in the dropdown so you know your own assigned color
  const allUsers = [me, ...others];
  
  const followedUser = followingUserId ? collaborators[followingUserId] : null;

  const displayCount = 3;
  const visibleAvatars = others.slice(0, displayCount);
  const remainingCount = others.length - displayCount;

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setShowDropdown(true)}
      onMouseLeave={() => setShowDropdown(false)}
    >
      <div className="flex items-center cursor-default">
        {visibleAvatars.map((user, i) => {
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
            <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-[#0d0d18] bg-emerald-500" />
          </div>
        );
      })}

      {remainingCount > 0 && (
        <div
          className="relative flex h-7 w-7 items-center justify-center rounded-full border border-[#0d0d18] bg-slate-800 text-[10px] font-bold text-white shadow-sm z-0"
          style={{ marginLeft: -8 }}
        >
          +{remainingCount}
        </div>
      )}

      {others.length === 0 && (
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-white/60">
          <Users size={13} />
          <span>Only you</span>
        </div>
      )}

      {followedUser && (
        <div className="ml-3 flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 pr-1 pl-3 shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-pulse">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Following {followedUser.name.split(' ')[0]}</span>
          <button 
            onClick={() => setFollowingUserId(null)}
            className="hover:bg-emerald-500/20 text-emerald-300 rounded-full h-4 w-4 flex items-center justify-center transition-colors"
            title="Stop following"
          >
            ×
          </button>
        </div>
      )}
    </div>

    {/* Dropdown Menu */}
    {showDropdown && allUsers.length > 1 && (
      <div className="absolute top-full right-0 mt-2 w-48 rounded-lg border border-white/10 bg-[#181828]/95 backdrop-blur-md shadow-xl py-1 z-50">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/40 border-b border-white/5 mb-1">
          Online Collaborators ({allUsers.length})
        </div>
        <div className="max-h-48 overflow-y-auto">
          {allUsers.map((user) => {
            const isMe = user.id === me.id;
            const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            return (
              <div key={user.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 transition-colors">
                <div 
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white relative"
                  style={{ backgroundColor: user.color }}
                >
                  {initials}
                  <div className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full border border-[#181828] bg-emerald-500" />
                </div>
                <div className="flex flex-col truncate flex-1">
                  <span className="text-[11px] font-medium text-white/90 flex items-center gap-1.5 truncate">
                    {user.name} {isMe && <span className="text-[9px] text-white/40">(You)</span>}
                  </span>
                </div>
                {!isMe && (
                  <button
                    onClick={() => setFollowingUserId(followingUserId === user.id ? null : user.id)}
                    className={`ml-2 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider transition-colors border ${
                      followingUserId === user.id 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                        : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white/80'
                    }`}
                  >
                    {followingUserId === user.id ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    )}
  </div>
  );
}
