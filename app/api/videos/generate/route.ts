import { NextRequest, NextResponse } from "next/server";
import { proxyPost } from "@/lib/proxy";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.prompt || typeof body.prompt !== "string") {
    return NextResponse.json(
      { error: "A non-empty 'prompt' string is required." },
      { status: 400 }
    );
  }
  return proxyPost("/api/v1/videos/generate", { prompt: body.prompt.trim() });
}
