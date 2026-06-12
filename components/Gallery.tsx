"use client";

import type { Generation } from "@/types";
import GenerationCard from "./GenerationCard";

interface Props {
  items: Generation[];
  onDelete: (id: string) => void;
}

export default function Gallery({ items, onDelete }: Props) {
  return (
    <section className="animate-riseIn">
      <h2 className="mb-4 font-display text-xs font-bold uppercase tracking-[0.3em] text-matrix neon sm:text-sm">
        &gt; Gallery
      </h2>

      {items.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <p className="font-mono text-sm text-matrix-dim/70">
            Nothing generated yet. Enter a prompt above to create your first
            image or video.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <GenerationCard key={item.id} item={item} onDelete={onDelete} />
          ))}
        </div>
      )}
    </section>
  );
}
