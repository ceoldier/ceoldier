/** UI model ids -> imgeditor model strings.
 *  Costs are in imgeditor credits; friend balances use the same units (1:1). */
export const MODELS = {
  nano: { upstream: "nano-banana", label: "Standard", cost: 1 },
  pro: { upstream: "nano-banana-pro", label: "Pro 2K", cost: 6 },
} as const;

export type ModelId = keyof typeof MODELS;

/** Ratios supported by BOTH nano-banana and nano-banana-pro. */
export const RATIOS = ["1:1", "3:4", "4:3", "9:16", "16:9"] as const;
export type Ratio = (typeof RATIOS)[number];

/** VEO 3.1 Fast runs 10–35 imgeditor credits depending on length/res/audio.
 *  Flat charge for friends; tune after you see real credits_used values. */
export const VIDEO_COST = 15;

export function isModelId(v: unknown): v is ModelId {
  return v === "nano" || v === "pro";
}
export function isRatio(v: unknown): v is Ratio {
  return typeof v === "string" && (RATIOS as readonly string[]).includes(v);
}
