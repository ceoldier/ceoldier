import { NextRequest, NextResponse } from "next/server";
import { startJob } from "@/lib/proxy";
import { spend } from "@/lib/redis";
import { verifySession, SESSION_COOKIE } from "@/lib/session";
import { MODELS, isModelId, isRatio } from "@/lib/options";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const code = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!code) {
    return NextResponse.json({ error: "Access denied." }, { status: 401 });
  }

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

  try {
    await spend(code, model.cost);
  } catch {
    return NextResponse.json(
      {
        error: `Not enough generations left (${model.label} costs ${model.cost}). Contact the operator to top up.`,
      },
      { status: 402 }
    );
  }

  return startJob("/api/v1/images/generate", {
    prompt: body.prompt.trim(),
    model: model.upstream,
    image_size: ratio, // ⚠ verify field name against imgeditor docs
  });
}
