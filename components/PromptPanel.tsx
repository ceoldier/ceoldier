"use client";

import type { MediaKind } from "@/types";
import { MODELS, RATIOS, type ModelId, type Ratio } from "@/lib/options";

interface Props {
  busy: boolean;
  kind: MediaKind;
  prompt: string;
  model: ModelId;
  ratio: Ratio;
  onKindChange: (kind: MediaKind) => void;
  onPromptChange: (prompt: string) => void;
  onModelChange: (model: ModelId) => void;
  onRatioChange: (ratio: Ratio) => void;
  onGenerate: () => void;
  onSavePrompt: () => void;
}

export default function PromptPanel({
  busy,
  kind,
  prompt,
  model,
  ratio,
  onKindChange,
  onPromptChange,
  onModelChange,
  onRatioChange,
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

      {/* Options row: model (images only) + aspect ratio */}
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        {kind === "image" && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-matrix-dim/60">
              Model
            </span>
            <div
              className="flex rounded-lg border border-matrix/30 p-0.5"
              role="tablist"
              aria-label="Model"
            >
              {(Object.keys(MODELS) as ModelId[]).map((id) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={model === id}
                  onClick={() => onModelChange(id)}
                  title={`Costs ${MODELS[id].cost} generation${MODELS[id].cost > 1 ? "s" : ""}`}
                  className={`rounded-md px-3 py-1 font-mono text-[10px] uppercase tracking-widest transition-all ${
                    model === id
                      ? "bg-matrix/20 text-matrix shadow-glow-sm"
                      : "text-matrix-dim/60 hover:text-matrix"
                  }`}
                >
                  {MODELS[id].label}
                  {MODELS[id].cost > 1 && (
                    <span className="ml-1 opacity-70">×{MODELS[id].cost}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-matrix-dim/60">
            Size
          </span>
          <div className="flex flex-wrap gap-1" role="tablist" aria-label="Aspect ratio">
            {RATIOS.map((r) => (
              <button
                key={r}
                role="tab"
                aria-selected={ratio === r}
                onClick={() => onRatioChange(r)}
                className={`rounded-md border px-2.5 py-1 font-mono text-[10px] tracking-widest transition-all ${
                  ratio === r
                    ? "border-matrix/60 bg-matrix/20 text-matrix shadow-glow-sm"
                    : "border-matrix/20 text-matrix-dim/60 hover:text-matrix"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
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
