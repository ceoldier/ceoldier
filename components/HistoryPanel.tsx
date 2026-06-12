"use client";

import type { Generation } from "@/types";

interface Props {
  items: Generation[];
  onUse: (prompt: string) => void;
  onClear: () => void;
}

const STATUS_DOT: Record<Generation["status"], string> = {
  queued: "bg-yellow-400",
  processing: "bg-cyan-400 animate-pulse",
  completed: "bg-matrix",
  failed: "bg-red-500",
};

export default function HistoryPanel({ items, onUse, onClear }: Props) {
  return (
    <section className="glass animate-riseIn rounded-2xl p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-xs font-bold uppercase tracking-[0.3em] text-matrix neon">
          &gt; History
        </h2>
        {items.length > 0 && (
          <button
            onClick={onClear}
            className="font-mono text-[10px] uppercase tracking-widest text-matrix-dim/50 transition-colors hover:text-red-400"
          >
            Clear
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="font-mono text-xs text-matrix-dim/60">
          Your generation history appears here.
        </p>
      ) : (
        <ul className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onUse(item.prompt)}
                className="group flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-matrix/10"
                title="Click to reuse this prompt"
              >
                <span
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[item.status]}`}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-mono text-xs text-matrix-dim group-hover:text-matrix">
                    {item.prompt}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-matrix-dim/40">
                    {item.kind} ·{" "}
                    {new Date(item.createdAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
