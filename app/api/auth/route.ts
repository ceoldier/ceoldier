import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

async function tokenFor(code: string): Promise<string> {
  const data = new TextEncoder().encode(code + "::ceoldier-gate-v1");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(req: NextRequest) {
  const secret = process.env.ACCESS_CODE;
  if (!secret) {
    return NextResponse.json(
      { error: "Server is missing ACCESS_CODE. Set it in Vercel env vars." },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim() : "";

  if (!code || code !== secret) {
    return NextResponse.json({ error: "Invalid access code." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("ceoldier_access", await tokenFor(code), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
  return res;
}
