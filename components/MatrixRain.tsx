"use client";

import { useEffect, useRef } from "react";

const GLYPHS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノ" +
  "ハヒフヘホマミムメモヤユヨラリルレロワヲン" +
  "0123456789ABCDEFXZ$#@%&*+=<>/\\|";

export default function MatrixRain() {
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
    let cols = 0;
    let drops: number[] = [];
    let speeds: number[] = [];
    const fontSize = 16;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Math.ceil(canvas.width / fontSize);
      drops = Array.from({ length: cols }, () =>
        Math.floor(Math.random() * (canvas.height / fontSize))
      );
      speeds = Array.from({ length: cols }, () => 0.5 + Math.random() * 0.9);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);

    let last = 0;
    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (t - last < 50) return; // ~20fps is plenty and battery-friendly
      last = t;

      // Fade trail
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < cols; i++) {
        const char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Bright head glyph
        ctx.fillStyle = "rgba(190, 255, 215, 0.95)";
        ctx.fillText(char, x, y);
        // Dim glyph just behind the head for a glow trail
        ctx.fillStyle = "rgba(0, 255, 102, 0.55)";
        ctx.fillText(
          GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
          x,
          y - fontSize
        );

        drops[i] += speeds[i];
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
          speeds[i] = 0.5 + Math.random() * 0.9;
        }
      }
    };

    if (reduced) {
      // Static frame for users who prefer reduced motion
      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < canvas.height / fontSize; j += 3) {
          if (Math.random() > 0.85) {
            ctx.fillStyle = `rgba(0, 255, 102, ${0.1 + Math.random() * 0.25})`;
            ctx.fillText(
              GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
              i * fontSize,
              j * fontSize
            );
          }
        }
      }
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 opacity-60"
    />
  );
}
