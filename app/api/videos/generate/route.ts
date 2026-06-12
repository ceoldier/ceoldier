import { NextRequest, NextResponse } from "next/server";
import { startJob } from "@/lib/proxy";
import { spend } from "@/lib/redis";
import { verifySession, SESSION_COOKIE } from "@/lib/session";

export const runtime = "nodejs";
const COST = 3; // videos burn more upstream credits — tune as needed

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

  try {
    await spend(code, COST);
  } catch {
    return NextResponse.json(
      { error: "Not enough generations left for a video. Contact the operator." },
      { status: 402 }
    );
  }

  return startJob("/api/v1/videos/generate", body.prompt.trim());
}
