"use client";

import type { SavedPrompt } from "@/types";

interface Props {
  prompts: SavedPrompt[];
  onUse: (prompt: string) => void;
  onDelete: (id: string) => void;
}

export default function SavedPrompts({ prompts, onUse, onDelete }: Props) {
  return (
    <section className="glass animate-riseIn rounded-2xl p-4 sm:p-5">
      <h2 className="mb-3 font-display text-xs font-bold uppercase tracking-[0.3em] text-matrix neon">
        &gt; Saved Prompts
      </h2>

      {prompts.length === 0 ? (
        <p className="font-mono text-xs text-matrix-dim/60">
          Save a prompt from the command input to reuse it here.
        </p>
      ) : (
        <ul className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
          {prompts.map((p) => (
            <li
              key={p.id}
              className="group flex items-center gap-2 rounded-lg px-2.5 py-2 transition-colors hover:bg-matrix/10"
            >
              <button
                onClick={() => onUse(p.text)}
                className="min-w-0 flex-1 text-left"
                title="Load into command input"
              >
                <span className="block truncate font-mono text-xs text-matrix-dim group-hover:text-matrix">
                  {p.text}
                </span>
              </button>
              <button
                onClick={() => onDelete(p.id)}
                className="shrink-0 font-mono text-xs text-matrix-dim/30 transition-colors hover:text-red-400"
                aria-label={`Delete saved prompt: ${p.text}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
