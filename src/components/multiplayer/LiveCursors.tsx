import React from 'react';
import { useReactFlow } from '@xyflow/react';
import { useMultiplayerStore } from '../../store/multiplayerStore';
import { me } from '../../hooks/useMultiplayer';

// A simple cursor SVG
const CursorIcon = ({ color }: { color: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
  >
    <path
      d="M5.65376 21.0069C5.32832 21.229 4.88729 21.0189 4.83549 20.6178L2.09115 1.55938C2.03222 1.1501 2.45781 0.851759 2.83669 1.03681L21.7249 10.2741C22.1009 10.458 22.1265 10.9904 21.7701 11.2141L13.8821 16.1432C13.6841 16.2669 13.5298 16.4449 13.4357 16.6575L9.62059 25.2678C9.43577 25.6848 8.84713 25.7077 8.63222 25.3045L5.65376 21.0069Z"
      fill={color}
      stroke="white"
      strokeWidth="1.5"
    />
  </svg>
);

export function LiveCursors() {
  const cursors = useMultiplayerStore((s) => s.cursors);
  const collaborators = useMultiplayerStore((s) => s.collaborators);
  const { flowToScreenPosition } = useReactFlow();

  // Render a cursor for each active user that isn't us
  return (
    <>
      {Object.entries(cursors).map(([id, pos]) => {
        if (id === me.id) return null;
        
        const user = collaborators[id];
        if (!user) return null;

        // Convert the broadcasted flow position back to absolute screen coordinates 
        // to overlay correctly over the zooming canvas.
        const screenPos = flowToScreenPosition({ x: pos.x, y: pos.y });

        return (
          <div
            key={id}
            className="pointer-events-none fixed z-[9999] transition-all duration-[50ms] ease-linear"
            style={{
              left: screenPos.x,
              top: screenPos.y,
            }}
          >
            <CursorIcon color={user.color} />
            <div
              className="mt-1 ml-4 rounded px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm"
              style={{ backgroundColor: user.color, whiteSpace: 'nowrap', width: 'max-content' }}
            >
              {user.name}
            </div>
          </div>
        );
      })}
    </>
  );
}
