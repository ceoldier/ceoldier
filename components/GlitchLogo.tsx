"use client";

import { useEffect, useRef } from "react";

/**
 * CEOLDIER logo rendered as ~2000 particles sampled from text pixels.
 * Cycle: FORMED (with random glitch slices) -> DISSOLVE -> SCATTERED -> REFORM.
 */

type Phase = "formed" | "dissolve" | "scattered" | "reform";

interface Particle {
  hx: number; // home x
  hy: number; // home y
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

const TEXT = "CEOLDIER";
const PHASE_MS: Record<Phase, number> = {
  formed: 3400,
  dissolve: 900,
  scattered: 700,
  reform: 1100,
};

export default function GlitchLogo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let raf = 0;
    let particles: Particle[] = [];
    let phase: Phase = "formed";
    let phaseStart = performance.now();
    let W = 0;
    let H = 0;

    const sampleText = () => {
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Render text offscreen and sample lit pixels
      const off = document.createElement("canvas");
      off.width = W;
      off.height = H;
      const octx = off.getContext("2d")!;
      const fontSize = Math.min(W / (TEXT.length * 0.72), H * 0.62);
      octx.font = `900 ${fontSize}px var(--font-display), monospace`;
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      octx.fillStyle = "#fff";
      octx.fillText(TEXT, W / 2, H / 2);

      const img = octx.getImageData(0, 0, W, H).data;
      const gap = Math.max(2, Math.floor(fontSize / 26));
      particles = [];
      for (let y = 0; y < H; y += gap) {
        for (let x = 0; x < W; x += gap) {
          if (img[(y * W + x) * 4 + 3] > 128) {
            particles.push({
              hx: x,
              hy: y,
              x,
              y,
              vx: 0,
              vy: 0,
              size: gap * 0.62,
            });
          }
        }
      }
    };

    const scatter = () => {
      for (const p of particles) {
        p.vx = (Math.random() - 0.5) * 9;
        p.vy = (Math.random() - 0.5) * 9 - 2;
      }
    };

    sampleText();
    const onResize = () => sampleText();
    window.addEventListener("resize", onResize);

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      const elapsed = now - phaseStart;

      // Phase transitions
      if (elapsed > PHASE_MS[phase]) {
        phaseStart = now;
        if (phase === "formed") {
          phase = "dissolve";
          scatter();
        } else if (phase === "dissolve") {
          phase = "scattered";
        } else if (phase === "scattered") {
          phase = "reform";
        } else {
          phase = "formed";
        }
      }

      ctx.clearRect(0, 0, W, H);

      const glitching =
        phase === "formed" && Math.random() < 0.06; // brief glitch bursts
      const sliceShift = glitching ? (Math.random() - 0.5) * 18 : 0;
      const sliceY = Math.random() * H;
      const sliceH = 6 + Math.random() * 20;

      for (const p of particles) {
        if (phase === "dissolve" || phase === "scattered") {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.985;
          p.vy *= 0.985;
        } else if (phase === "reform") {
          p.x += (p.hx - p.x) * 0.12;
          p.y += (p.hy - p.y) * 0.12;
        } else {
          // formed: subtle shimmer
          p.x = p.hx + (Math.random() - 0.5) * 0.6;
          p.y = p.hy + (Math.random() - 0.5) * 0.6;
        }

        let dx = 0;
        let color = "rgba(0, 255, 102, 0.95)";
        if (glitching && p.y > sliceY && p.y < sliceY + sliceH) {
          dx = sliceShift;
          color = Math.random() > 0.5 ? "#00ffd0" : "#aaffcc";
        }
        const alpha =
          phase === "scattered"
            ? 0.45
            : phase === "dissolve"
              ? 0.7
              : 0.95;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.fillRect(p.x + dx, p.y, p.size, p.size);
      }
      ctx.globalAlpha = 1;
    };

    if (reduced) {
      // Static formed logo
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "rgba(0, 255, 102, 0.95)";
      for (const p of particles) ctx.fillRect(p.hx, p.hy, p.size, p.size);
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="relative w-full">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="CEOLDIER"
        className="h-24 w-full sm:h-32 md:h-40"
        style={{ filter: "drop-shadow(0 0 18px rgba(0,255,102,0.5))" }}
      />
      <p className="mt-1 text-center font-mono text-[10px] uppercase tracking-[0.5em] text-matrix-dim/70 sm:text-xs">
        <span className="glitch" data-text="AI Generation Laboratory">
          AI Generation Laboratory
        </span>
      </p>
    </div>
  );
}
