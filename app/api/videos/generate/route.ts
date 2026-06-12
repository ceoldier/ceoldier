import { NextRequest, NextResponse } from "next/server";
import { startJob } from "@/lib/proxy";
import { spend } from "@/lib/redis";
import { verifySession, SESSION_COOKIE } from "@/lib/session";
import { VIDEO_COST, isRatio } from "@/lib/options";

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

  const ratio = isRatio(body.ratio) ? body.ratio : "16:9";

  try {
    await spend(code, VIDEO_COST);
  } catch {
    return NextResponse.json(
      { error: `Not enough generations left (video costs ${VIDEO_COST}).` },
      { status: 402 }
    );
  }

  return startJob("/api/v1/videos/generate", {
    prompt: body.prompt.trim(),
    image_size: ratio, // ⚠ verify field name against imgeditor docs
  });
}
