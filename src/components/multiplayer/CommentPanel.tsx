import React, { useState } from 'react';
import { useMultiplayerStore, type CommentMessage } from '../../store/multiplayerStore';
import { me, useMultiplayer } from '../../hooks/useMultiplayer';
import { useParams } from 'react-router-dom';
import { X, Check, Send } from 'lucide-react';

export function CommentPanel() {
  const { id: workflowId } = useParams<{ id: string }>();
  const { broadcastCommentMessage, broadcastCommentResolve } = useMultiplayer(workflowId);
  const activeCommentThreadId = useMultiplayerStore((s) => s.activeCommentThreadId);
  const setActiveCommentThreadId = useMultiplayerStore((s) => s.setActiveCommentThreadId);
  const comments = useMultiplayerStore((s) => s.comments);
  const addCommentMessage = useMultiplayerStore((s) => s.addCommentMessage);
  const resolveCommentThread = useMultiplayerStore((s) => s.resolveCommentThread);

  const [newMessage, setNewMessage] = useState('');

  const activeThread = activeCommentThreadId ? comments[activeCommentThreadId] : null;

  if (!activeThread || activeThread.resolved) {
    if (activeCommentThreadId) {
      // Auto-close if resolved
      setTimeout(() => setActiveCommentThreadId(null), 0);
    }
    return null;
  }

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !activeCommentThreadId) return;

    const message: CommentMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      authorId: me.id,
      authorName: me.name,
      authorColor: me.color,
      text: newMessage.trim(),
      timestamp: Date.now(),
    };

    addCommentMessage(activeCommentThreadId, message);
    broadcastCommentMessage(activeCommentThreadId, message);
    setNewMessage('');
  };

  const handleResolve = () => {
    if (!activeCommentThreadId) return;
    resolveCommentThread(activeCommentThreadId);
    broadcastCommentResolve(activeCommentThreadId);
    setActiveCommentThreadId(null);
  };

  return (
    <div className="absolute right-4 top-24 z-[9998] flex w-80 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0d0d18]/95 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-4 py-3">
        <h3 className="text-sm font-semibold text-white">Thread</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResolve}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
            title="Resolve thread"
          >
            <Check size={12} />
            Resolve
          </button>
          <button
            onClick={() => setActiveCommentThreadId(null)}
            className="rounded p-1 text-white/50 hover:bg-white/10 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex max-h-96 flex-col gap-4 overflow-y-auto p-4">
        {activeThread.messages.map((msg, i) => (
          <div key={msg.id} className="flex gap-3">
            <div
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-sm"
              style={{ backgroundColor: msg.authorColor }}
            >
              {msg.authorName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold text-white/90">{msg.authorName}</span>
                <span className="text-[9px] text-white/40">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-white/70 leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-white/5 bg-white/[0.02] p-3">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Reply..."
            autoFocus
            className="w-full rounded-lg border border-white/10 bg-black/20 py-2.5 pl-3 pr-10 text-sm text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="absolute right-1.5 rounded-md p-1.5 text-blue-400 transition-colors hover:bg-blue-500/20 disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
