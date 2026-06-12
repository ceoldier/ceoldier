import type { Generation, SavedPrompt } from "@/types";

const HISTORY_KEY = "ceoldier.history.v1";
const PROMPTS_KEY = "ceoldier.prompts.v1";
const HISTORY_LIMIT = 100;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable — fail silently */
  }
}

/* ---------- History ---------- */

export function loadHistory(): Generation[] {
  return read<Generation[]>(HISTORY_KEY, []);
}

export function saveHistory(items: Generation[]): void {
  write(HISTORY_KEY, items.slice(0, HISTORY_LIMIT));
}

/* ---------- Saved prompts ---------- */

export function loadPrompts(): SavedPrompt[] {
  return read<SavedPrompt[]>(PROMPTS_KEY, []);
}

export function savePrompts(items: SavedPrompt[]): void {
  write(PROMPTS_KEY, items);
}

/* ---------- Misc ---------- */

export function uid(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  ).toUpperCase();
}
