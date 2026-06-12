import { NextResponse } from "next/server";

const BASE = process.env.API_BASE_URL;
const KEY = process.env.API_KEY;

function configError(): NextResponse | null {
  if (!BASE || !KEY) {
    return NextResponse.json(
      {
        error:
          "Server is missing API_BASE_URL or API_KEY. Set them in .env.local (local) or in Vercel project settings (production).",
      },
      { status: 500 }
    );
  }
  return null;
}

export async function proxyPost(
  path: string,
  body: unknown
): Promise<NextResponse> {
  const err = configError();
  if (err) return err;

  try {
    const upstream = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.API_KEY}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the generation API." },
      { status: 502 }
    );
  }
}

export async function proxyGet(
  path: string,
  search: URLSearchParams
): Promise<NextResponse> {
  const err = configError();
  if (err) return err;

  try {
    const qs = search.toString();
    const upstream = await fetch(`${BASE}${path}${qs ? `?${qs}` : ""}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
      },
      cache: "no-store",
    });
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the generation API." },
      { status: 502 }
    );
  }
}
