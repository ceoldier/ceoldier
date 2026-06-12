import { NextRequest, NextResponse } from "next/server";
import { getBalance } from "@/lib/redis";
import { makeSession, SESSION_COOKIE } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!process.env.ACCESS_CODE) {
    return NextResponse.json(
      { error: "Server is missing ACCESS_CODE (signing secret)." },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!code) {
    return NextResponse.json({ error: "Enter your access code." }, { status: 400 });
  }

  const balance = await getBalance(code).catch(() => null);
  if (balance === null) {
    return NextResponse.json({ error: "Invalid access code." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, remaining: balance });
  res.cookies.set(SESSION_COOKIE, await makeSession(code), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 90, // 90 days; balance is the real limiter
    path: "/",
  });
  return res;
}
