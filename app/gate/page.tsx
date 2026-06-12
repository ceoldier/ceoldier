"use client";

import { useState } from "react";
import MatrixRain from "@/components/MatrixRain";

export default function Gate() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const value = code.trim();
    if (!value || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: value }),
      });
      if (res.ok) {
        window.location.href = "/";
        return;
      }
      const body = await res.json().catch(() => ({}));
      setError(body?.error ?? "Access denied.");
    } catch {
      setError("Connection failed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4">
      <MatrixRain />
      <section className="glass animate-riseIn relative z-10 w-full max-w-md rounded-2xl p-6 sm:p-8">
        <h1 className="neon mb-1 text-center font-display text-2xl font-black uppercase tracking-[0.3em] text-matrix sm:text-3xl">
          CEOLDIER
        </h1>
        <p className="mb-6 text-center font-mono text-[10px] uppercase tracking-[0.4em] text-matrix-dim/60">
          Restricted access
        </p>

        <label
          htmlFor="code"
          className="mb-2 block font-mono text-xs uppercase tracking-widest text-matrix-dim"
        >
          &gt; Enter access code
        </label>
        <input
          id="code"
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          autoFocus
          autoComplete="off"
          placeholder="••••••••"
          className="input-matrix w-full rounded-xl p-4 font-mono text-base tracking-widest"
        />

        {error && (
          <p
            role="alert"
            className="mt-3 font-mono text-xs text-red-400 animate-riseIn"
          >
            ✕ {error}
          </p>
        )}

        <button
          onClick={submit}
          disabled={busy || !code.trim()}
          className="btn-matrix animate-pulseGlow mt-5 w-full rounded-xl px-6 py-3.5 font-display text-sm font-bold uppercase tracking-[0.25em]"
        >
          {busy ? "Verifying…" : "Enter the lab"}
        </button>

        <p className="mt-5 text-center font-mono text-[10px] leading-relaxed text-matrix-dim/50">
          Access is by invitation. If you have a subscription and lost your
          code, contact the operator.
        </p>
      </section>
    </main>
  );
}
