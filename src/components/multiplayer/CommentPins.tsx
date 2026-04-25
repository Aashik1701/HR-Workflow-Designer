import React from 'react';
import { useReactFlow } from '@xyflow/react';
import { useMultiplayerStore } from '../../store/multiplayerStore';
import { MessageSquare } from 'lucide-react';

export function CommentPins() {
  const comments = useMultiplayerStore((s) => s.comments);
  const activeCommentThreadId = useMultiplayerStore((s) => s.activeCommentThreadId);
  const setActiveCommentThreadId = useMultiplayerStore((s) => s.setActiveCommentThreadId);
  const { flowToScreenPosition } = useReactFlow();

  const activeThreads = Object.values(comments).filter(c => !c.resolved);

  return (
    <>
      {activeThreads.map((thread) => {
        const screenPos = flowToScreenPosition({ x: thread.x, y: thread.y });
        const isActive = activeCommentThreadId === thread.id;
        const authorColor = thread.messages.length > 0 ? thread.messages[0].authorColor : '#6366f1';

        return (
          <div
            key={thread.id}
            className="fixed z-[9997]"
            style={{
              left: screenPos.x,
              top: screenPos.y,
              transform: 'translate(-50%, -100%)', // Pin points to the exact coordinate
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveCommentThreadId(isActive ? null : thread.id);
              }}
              className={`relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 transition-transform hover:scale-110 shadow-lg ${
                isActive ? 'scale-110 ring-2 ring-white/50' : ''
              }`}
              style={{
                backgroundColor: '#181828',
                borderColor: authorColor,
              }}
            >
              <MessageSquare size={14} color={authorColor} />
              
              {/* Comment count badge */}
              {thread.messages.length > 1 && (
                <div className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[9px] font-bold text-white shadow-sm">
                  {thread.messages.length}
                </div>
              )}
              
              {/* Pin tail */}
              <div 
                className="absolute -bottom-1.5 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-r-2 border-b-2 bg-[#181828]"
                style={{ borderColor: authorColor }}
              />
            </button>
          </div>
        );
      })}
    </>
  );
}
