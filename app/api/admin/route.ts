import { NextRequest, NextResponse } from "next/server";
import { deleteCode, getBalance, setBalance } from "@/lib/redis";

export const runtime = "nodejs";

function authorized(secret: unknown): boolean {
  return (
    typeof secret === "string" &&
    !!process.env.ACCESS_CODE &&
    secret === process.env.ACCESS_CODE
  );
}

/**
 * POST { secret, code, credits }  -> create/top-up a code
 * POST { secret, code, action: "delete" } -> revoke a code
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!authorized(body?.secret)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!code) {
    return NextResponse.json({ error: "Missing code." }, { status: 400 });
  }

  if (body?.action === "delete") {
    await deleteCode(code);
    return NextResponse.json({ ok: true, deleted: code });
  }

  const credits = Number(body?.credits);
  if (!Number.isFinite(credits) || credits < 0) {
    return NextResponse.json({ error: "Missing credits." }, { status: 400 });
  }
  await setBalance(code, credits);
  return NextResponse.json({ ok: true, code, remaining: credits });
}

/** GET ?secret=...&code=... -> check a balance */
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!authorized(secret)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const code = req.nextUrl.searchParams.get("code") ?? "";
  const balance = await getBalance(code);
  if (balance === null) {
    return NextResponse.json({ error: "No such code." }, { status: 404 });
  }
  return NextResponse.json({ code, remaining: balance });
}
