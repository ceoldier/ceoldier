import { NextRequest, NextResponse } from "next/server";
import { proxyGet } from "@/lib/proxy";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "Query parameter 'id' is required." },
      { status: 400 }
    );
  }
  return proxyGet("/api/v1/images/status", req.nextUrl.searchParams);
}
