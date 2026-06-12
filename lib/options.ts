/** UI model ids -> upstream model values.
 *  ⚠ VERIFY these strings against imgeditor.co's API docs and adjust. */
export const MODELS = {
  nano: { upstream: "nanobanana", label: "Standard", cost: 1 },
  pro: { upstream: "nanobanana-pro", label: "Pro", cost: 2 },
} as const;

export type ModelId = keyof typeof MODELS;

export const RATIOS = ["1:1", "3:4", "4:3", "9:16", "16:9"] as const;
export type Ratio = (typeof RATIOS)[number];

export const VIDEO_COST = 3;

export function isModelId(v: unknown): v is ModelId {
  return v === "nano" || v === "pro";
}
export function isRatio(v: unknown): v is Ratio {
  return typeof v === "string" && (RATIOS as readonly string[]).includes(v);
}
