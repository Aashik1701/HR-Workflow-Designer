import React, { useEffect, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useMultiplayerStore } from '../../store/multiplayerStore';

export function LivePings() {
  const pings = useMultiplayerStore((s) => s.pings);
  const removePing = useMultiplayerStore((s) => s.removePing);
  const { flowToScreenPosition } = useReactFlow();

  // Cleanup pings after animation (2 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      pings.forEach((ping) => {
        if (now - ping.createdAt > 2000) {
          removePing(ping.id);
        }
      });
    }, 500);
    return () => clearInterval(interval);
  }, [pings, removePing]);

  return (
    <>
      {pings.map((ping) => {
        const screenPos = flowToScreenPosition({ x: ping.x, y: ping.y });
        return (
          <div
            key={ping.id}
            className="pointer-events-none fixed z-[9998] flex items-center justify-center"
            style={{
              left: screenPos.x,
              top: screenPos.y,
            }}
          >
            {/* Core dot */}
            <div
              className="absolute h-3 w-3 rounded-full"
              style={{ backgroundColor: ping.color, transform: 'translate(-50%, -50%)' }}
            />
            {/* Expanding ripple 1 */}
            <div
              className="absolute h-3 w-3 animate-ping rounded-full opacity-75"
              style={{ backgroundColor: ping.color, transform: 'translate(-50%, -50%)', animationDuration: '1.5s' }}
            />
            {/* Expanding ripple 2 (delayed) */}
            <div
              className="absolute h-8 w-8 animate-ping rounded-full opacity-50"
              style={{
                backgroundColor: ping.color,
                transform: 'translate(-50%, -50%)',
                animationDuration: '2s',
                animationDelay: '0.2s',
              }}
            />
          </div>
        );
      })}
    </>
  );
}
