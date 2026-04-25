import { useState } from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import { Sparkles, ArrowRight, Loader2, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateWorkflowFromPrompt } from '../../api/copilot';

const EXAMPLE_PROMPTS = [
  'Send a welcome email then create a Jira ticket',
  'Wait 3 days then notify on Slack if not approved',
  'Manager approval then generate offer letter',
  'A/B test: email vs slack for onboarding nudge',
  'Schedule onboarding meeting and update the record',
];

export function AICopilot() {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const { setNodes, setEdges } = useWorkflowStore();

  const hasKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY);

  const handleGenerate = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    setGenerating(true);
    setShowExamples(false);

    const toastId = toast.loading(
      hasKey ? '🤖 Gemini is designing your pipeline…' : '⚡ Building pipeline from prompt…'
    );

    try {
      const result = await generateWorkflowFromPrompt(trimmed);
      const usedFallback = '_usedFallback' in result && result._usedFallback;

      if (result.nodes.length === 0) {
        toast.error("Couldn't understand that prompt. Try being more specific.", { id: toastId });
        return;
      }

      setNodes(result.nodes);
      setEdges(result.edges);
      setPrompt('');

      if (usedFallback) {
        toast(
          `⚡ Built with keyword engine (Gemini quota hit) — ${result.nodes.length} nodes`,
          { id: toastId, icon: '⚡', duration: 5000 }
        );
      } else {
        toast.success(
          hasKey
            ? `✨ Gemini generated ${result.nodes.length} nodes!`
            : `⚡ Pipeline built with ${result.nodes.length} nodes`,
          { id: toastId }
        );
      }
    } catch (err) {
      console.error('[AICopilot]', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed: ${message.slice(0, 80)}`, { id: toastId });
    } finally {
      setGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
    if (e.key === 'Escape') {
      setShowExamples(false);
    }
  };

  const pickExample = (example: string) => {
    setPrompt(example);
    setShowExamples(false);
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-[560px] max-w-[92vw]">
      {/* Example prompts bubble */}
      {showExamples && (
        <div className="mb-3 bg-[#1a1a2e]/95 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 px-1 mb-2">
            Try an example
          </p>
          <div className="flex flex-col gap-1">
            {EXAMPLE_PROMPTS.map((ex) => (
              <button
                key={ex}
                onClick={() => pickExample(ex)}
                className="text-left text-xs text-white/70 hover:text-white hover:bg-white/5 px-3 py-2 rounded-xl transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="relative group">
        {/* Animated glow ring */}
        <div
          className={`absolute -inset-1 rounded-full blur transition-all duration-700 ${
            generating
              ? 'opacity-70 bg-gradient-to-r from-fuchsia-600 via-violet-600 to-sky-600 animate-pulse'
              : 'opacity-25 group-hover:opacity-50 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-sky-600'
          }`}
        />

        {/* Input pill */}
        <div className="relative bg-[#1a1a2e]/90 backdrop-blur-md border border-white/10 rounded-full flex items-center p-2 shadow-2xl">
          {/* Sparkle / Wand icon */}
          <div className="pl-3 pr-2 text-violet-400 flex-shrink-0">
            {generating ? (
              <Loader2 size={20} className="animate-spin" />
            ) : hasKey ? (
              <Sparkles size={20} />
            ) : (
              <Wand2 size={20} />
            )}
          </div>

          <input
            type="text"
            className="flex-1 bg-transparent border-none text-white text-sm placeholder-white/30 focus:outline-none focus:ring-0 px-2 py-1.5 min-w-0"
            placeholder={
              hasKey
                ? 'Describe your workflow — Gemini will build it…'
                : 'Describe your workflow (e.g. send email then create ticket)…'
            }
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowExamples(true)}
            disabled={generating}
          />

          {/* Examples toggle */}
          <button
            type="button"
            onClick={() => setShowExamples((v) => !v)}
            disabled={generating}
            className="text-[10px] text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 rounded-full px-2.5 py-1 transition-colors mr-2 hidden sm:block flex-shrink-0"
            title="Show example prompts"
          >
            examples
          </button>

          {/* Submit */}
          <button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
            className="bg-violet-600 hover:bg-violet-500 disabled:bg-white/5 disabled:text-white/30 disabled:cursor-not-allowed text-white rounded-full p-2 transition-colors flex items-center justify-center flex-shrink-0"
            title="Generate workflow"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Label strip */}
      <div className="text-center mt-2.5">
        <span className="text-[10px] font-medium tracking-widest uppercase text-white/40 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/5">
          {hasKey ? '✦ AI Workflow Copilot — Gemini 2.0 Flash' : '✦ AI Workflow Copilot — Keyword Engine'}
        </span>
      </div>
    </div>
  );
}
