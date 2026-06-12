import { NextRequest, NextResponse } from "next/server";
import { startJob } from "@/lib/proxy";
import { MODELS, isModelId, isRatio } from "@/lib/options";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.prompt || typeof body.prompt !== "string") {
    return NextResponse.json(
      { error: "A non-empty 'prompt' string is required." },
      { status: 400 }
    );
  }

  const modelId = isModelId(body.model) ? body.model : "nano";
  const ratio = isRatio(body.ratio) ? body.ratio : "1:1";
  const model = MODELS[modelId];

  const payload: Record<string, unknown> = {
    prompt: body.prompt.trim(),
    mode: "text",
    model: model.upstream,
    aspect_ratio: ratio,
    num_images: 1,
    output_format: "png",
  };
  if (modelId === "pro") {
    payload.resolution = "2K";
  }

  return startJob("/api/v1/images/generate", payload);
}
