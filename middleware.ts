import { NextRequest, NextResponse } from "next/server";

const COOKIE = "ceoldier_access";

async function expectedToken(): Promise<string | null> {
  const code = process.env.ACCESS_CODE;
  if (!code) return null;
  const data = new TextEncoder().encode(code + "::ceoldier-gate-v1");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname === "/gate" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const expected = await expectedToken();
  const token = req.cookies.get(COOKIE)?.value;
  if (expected && token === expected) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Access denied." }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/gate";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
