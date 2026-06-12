"use client";

import type { MediaKind } from "@/types";

interface Props {
  busy: boolean;
  kind: MediaKind;
  prompt: string;
  onKindChange: (kind: MediaKind) => void;
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;
  onSavePrompt: () => void;
}

export default function PromptPanel({
  busy,
  kind,
  prompt,
  onKindChange,
  onPromptChange,
  onGenerate,
  onSavePrompt,
}: Props) {
  const canSubmit = !busy && prompt.trim().length > 0;

  return (
    <section className="glass animate-riseIn rounded-2xl p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-xs font-bold uppercase tracking-[0.3em] text-matrix neon sm:text-sm">
          &gt; Command Input
        </h2>
        <div
          className="flex rounded-lg border border-matrix/30 p-0.5"
          role="tablist"
          aria-label="Output type"
        >
          {(["image", "video"] as MediaKind[]).map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={kind === k}
              onClick={() => onKindChange(k)}
              className={`rounded-md px-3 py-1.5 font-mono text-xs uppercase tracking-widest transition-all sm:px-4 ${
                kind === k
                  ? "bg-matrix/20 text-matrix shadow-glow-sm"
                  : "text-matrix-dim/60 hover:text-matrix"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && canSubmit) {
              onGenerate();
            }
          }}
          rows={3}
          placeholder={`Describe the ${kind} to generate…`}
          aria-label="Generation prompt"
          className="input-matrix w-full resize-none rounded-xl p-4 font-mono text-sm leading-relaxed sm:text-base"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-3 right-4 animate-blink text-matrix"
        >
          █
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onGenerate}
          disabled={!canSubmit}
          className="btn-matrix animate-pulseGlow flex-1 rounded-xl px-6 py-3.5 font-display text-sm font-bold uppercase tracking-[0.25em]"
        >
          {busy ? "Generating…" : `Generate ${kind}`}
        </button>
        <button
          onClick={onSavePrompt}
          disabled={!prompt.trim()}
          className="btn-matrix rounded-xl px-6 py-3.5 font-mono text-xs uppercase tracking-widest"
          title="Save this prompt for later"
        >
          Save prompt
        </button>
      </div>

      <p className="mt-3 text-right font-mono text-[10px] text-matrix-dim/50">
        ⌘/Ctrl + Enter to generate
      </p>
    </section>
  );
}
