import { NextRequest, NextResponse } from "next/server";
import { getJobStatus } from "@/lib/proxy";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const id =
    req.nextUrl.searchParams.get("id") ??
    req.nextUrl.searchParams.get("task_id");
  if (!id) {
    return NextResponse.json(
      { error: "Query parameter 'id' or 'task_id' is required." },
      { status: 400 }
    );
  }
  return getJobStatus("/api/v1/videos/status", id);
}