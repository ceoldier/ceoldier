"use client";

import type { Generation } from "@/types";

interface Props {
  item: Generation;
  onDelete: (id: string) => void;
}

async function downloadMedia(item: Generation) {
  if (!item.url) return;
  const ext = item.kind === "video" ? "mp4" : "png";
  const filename = `ceoldier-${item.kind}-${item.id.toLowerCase()}.${ext}`;
  try {
    const res = await fetch(item.url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    // Cross-origin fetch blocked — fall back to opening in a new tab
    window.open(item.url, "_blank", "noopener");
  }
}

export default function GenerationCard({ item, onDelete }: Props) {
  const pending = item.status === "queued" || item.status === "processing";

  return (
    <article className="glass glass-hover group animate-riseIn overflow-hidden rounded-2xl">
      <div className="relative aspect-square w-full bg-black/60">
        {pending && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-matrix/20 border-t-matrix shadow-glow-sm" />
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-matrix-dim animate-flicker">
              {item.status === "queued" ? "Queued" : "Rendering"}…
            </p>
          </div>
        )}

        {item.status === "failed" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
            <p className="font-display text-sm font-bold uppercase tracking-widest text-red-400">
              Failed
            </p>
            <p className="font-mono text-[10px] text-red-300/70">
              {item.error ?? "The generation could not be completed."}
            </p>
          </div>
        )}

        {item.status === "completed" && item.url && (
          item.kind === "video" ? (
            <video
              src={item.url}
              controls
              loop
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.url}
              alt={item.prompt}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          )
        )}

        <span className="absolute left-2 top-2 rounded-md border border-matrix/30 bg-black/70 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-matrix backdrop-blur-sm">
          {item.kind}
        </span>
      </div>

      <div className="p-3 sm:p-4">
        <p
          className="line-clamp-2 font-mono text-xs leading-relaxed text-matrix-dim"
          title={item.prompt}
        >
          {item.prompt}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => downloadMedia(item)}
            disabled={item.status !== "completed" || !item.url}
            className="btn-matrix flex-1 rounded-lg px-3 py-2 font-mono text-[10px] uppercase tracking-widest"
          >
            ↓ Download
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="rounded-lg border border-matrix/20 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-matrix-dim/60 transition-colors hover:border-red-500/50 hover:text-red-400"
            aria-label="Remove from gallery"
          >
            ✕
          </button>
        </div>
      </div>
    </article>
  );
}
