import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        matrix: {
          DEFAULT: "#00ff66",
          dim: "#00cc52",
          dark: "#003314",
          ghost: "rgba(0, 255, 102, 0.08)",
        },
        void: "#000000",
        panel: "rgba(0, 20, 8, 0.55)",
      },
      fontFamily: {
        display: ["var(--font-display)", "monospace"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(0, 255, 102, 0.35), 0 0 60px rgba(0, 255, 102, 0.12)",
        "glow-sm": "0 0 10px rgba(0, 255, 102, 0.3)",
        "glow-inset": "inset 0 0 30px rgba(0, 255, 102, 0.06)",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "92%": { opacity: "1" },
          "93%": { opacity: "0.6" },
          "94%": { opacity: "1" },
          "97%": { opacity: "0.8" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 12px rgba(0,255,102,0.25)" },
          "50%": { boxShadow: "0 0 28px rgba(0,255,102,0.55)" },
        },
        riseIn: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
      },
      animation: {
        scanline: "scanline 7s linear infinite",
        flicker: "flicker 4s linear infinite",
        pulseGlow: "pulseGlow 2.4s ease-in-out infinite",
        riseIn: "riseIn 0.5s ease-out both",
        blink: "blink 1.1s step-end infinite",
      },
    },
  },
  plugins: [],
};

export default config;
