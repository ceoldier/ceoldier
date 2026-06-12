"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import MatrixRain from "@/components/MatrixRain";
import GlitchLogo from "@/components/GlitchLogo";
import PromptPanel from "@/components/PromptPanel";
import Gallery from "@/components/Gallery";
import HistoryPanel from "@/components/HistoryPanel";
import SavedPrompts from "@/components/SavedPrompts";
import { pollUntilDone, startGeneration } from "@/lib/api";
import {
  loadHistory,
  loadPrompts,
  saveHistory,
  savePrompts,
  uid,
} from "@/lib/store";
import type { Generation, MediaKind, SavedPrompt } from "@/types";

export default function Home() {
  const [kind, setKind] = useState<MediaKind>("image");
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [items, setItems] = useState<Generation[]>([]);
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setItems(
      // Anything that was mid-flight when the page closed is stale
      loadHistory().map((g) =>
        g.status === "queued" || g.status === "processing"
          ? { ...g, status: "failed" as const, error: "Interrupted by reload." }
          : g
      )
    );
    setPrompts(loadPrompts());
    setHydrated(true);
  }, []);

  // Persist on change (after hydration, to avoid wiping storage with [])
  useEffect(() => {
    if (hydrated) saveHistory(items);
  }, [items, hydrated]);
  useEffect(() => {
    if (hydrated) savePrompts(prompts);
  }, [prompts, hydrated]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  const patchItem = useCallback((id: string, patch: Partial<Generation>) => {
    setItems((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...patch } : g))
    );
  }, []);

  const generate = useCallback(async () => {
    const text = prompt.trim();
    if (!text || busy) return;

    const localId = uid();
    const entry: Generation = {
      id: localId,
      kind,
      prompt: text,
      status: "queued",
      createdAt: Date.now(),
    };
    setItems((prev) => [entry, ...prev]);
    setBusy(true);

    try {
      const { id: jobId } = await startGeneration(kind, text);
      if (!jobId) throw new Error("API did not return a job id.");

      patchItem(localId, { status: "processing" });

      const result = await pollUntilDone(kind, jobId, (s) => {
        if (s === "queued" || s === "processing") {
          patchItem(localId, { status: s });
        }
      });

      if (result.status === "completed" && result.url) {
        patchItem(localId, { status: "completed", url: result.url });
        showToast(`${kind === "image" ? "Image" : "Video"} ready.`);
      } else {
        patchItem(localId, {
          status: "failed",
          error: result.error ?? "Generation failed upstream.",
        });
        showToast("Generation failed. Check the card for details.");
      }
    } catch (err) {
      patchItem(localId, {
        status: "failed",
        error: err instanceof Error ? err.message : "Unknown error.",
      });
      showToast("Generation failed. Check the card for details.");
    } finally {
      setBusy(false);
    }
  }, [prompt, kind, busy, patchItem, showToast]);

  const savePrompt = useCallback(() => {
    const text = prompt.trim();
    if (!text) return;
    setPrompts((prev) => {
      if (prev.some((p) => p.text === text)) return prev;
      return [{ id: uid(), text, createdAt: Date.now() }, ...prev];
    });
    showToast("Prompt saved.");
  }, [prompt, showToast]);

  const usePromptText = useCallback((text: string) => {
    setPrompt(text);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <main className="relative min-h-screen">
      <MatrixRain />

      {/* Slow vertical scan beam */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-30 h-24 animate-scanline bg-gradient-to-b from-transparent via-matrix/5 to-transparent"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
        <header className="mb-10">
          <GlitchLogo />
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: command + gallery */}
          <div className="space-y-6 lg:col-span-2">
            <PromptPanel
              busy={busy}
              kind={kind}
              prompt={prompt}
              onKindChange={setKind}
              onPromptChange={setPrompt}
              onGenerate={generate}
              onSavePrompt={savePrompt}
            />
            <Gallery
              items={items}
              onDelete={(id) =>
                setItems((prev) => prev.filter((g) => g.id !== id))
              }
            />
          </div>

          {/* Right: history + saved prompts */}
          <aside className="space-y-6">
            <HistoryPanel
              items={items}
              onUse={usePromptText}
              onClear={() => setItems([])}
            />
            <SavedPrompts
              prompts={prompts}
              onUse={usePromptText}
              onDelete={(id) =>
                setPrompts((prev) => prev.filter((p) => p.id !== id))
              }
            />
          </aside>
        </div>

        <footer className="mt-14 border-t border-matrix/10 pt-6 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-matrix-dim/40 animate-flicker">
            CEOLDIER // system online
          </p>
        </footer>
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className="glass fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-riseIn rounded-xl px-5 py-3 font-mono text-xs text-matrix shadow-glow"
        >
          {toast}
        </div>
      )}
    </main>
  );
}
