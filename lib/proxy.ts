import { NextResponse } from "next/server";

const BASE = process.env.API_BASE_URL;

function configError(): NextResponse | null {
  if (!BASE || !process.env.API_KEY) {
    return NextResponse.json(
      { error: "Server is missing API_BASE_URL or API_KEY." },
      { status: 500 }
    );
  }
  return null;
}

function normalizeStatus(s: string | undefined): string {
  if (s === "pending") return "queued";
  if (s === "completed" || s === "failed" || s === "processing") return s;
  return "processing";
}

/** POST upstream, unwrap imgeditor's { success, data: { task_id } } into { id } */
export async function startJob(
  path: string,
  prompt: string
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
      body: JSON.stringify({ prompt }),
      cache: "no-store",
    });
    const body = await upstream.json().catch(() => ({}));

    if (!upstream.ok || body?.success === false) {
      return NextResponse.json(
        { error: body?.error ?? body?.message ?? `Upstream error (${upstream.status})` },
        { status: upstream.status >= 400 ? upstream.status : 502 }
      );
    }

    const taskId = body?.data?.task_id;
    if (!taskId) {
      return NextResponse.json(
        { error: "Provider did not return a task_id." },
        { status: 502 }
      );
    }
    return NextResponse.json({ id: taskId });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the generation API." },
      { status: 502 }
    );
  }
}

/** GET upstream status?task_id=..., unwrap into { id, status, url, error } */
export async function getJobStatus(
  path: string,
  taskId: string
): Promise<NextResponse> {
  const err = configError();
  if (err) return err;

  try {
    const upstream = await fetch(
      `${BASE}${path}?task_id=${encodeURIComponent(taskId)}`,
      {
        headers: { Authorization: `Bearer ${process.env.API_KEY}` },
        cache: "no-store",
      }
    );
    const body = await upstream.json().catch(() => ({}));

    if (!upstream.ok || body?.success === false) {
      return NextResponse.json(
        { error: body?.error ?? body?.message ?? `Upstream error (${upstream.status})` },
        { status: upstream.status >= 400 ? upstream.status : 502 }
      );
    }

    const d = body?.data ?? {};
    return NextResponse.json({
      id: taskId,
      status: normalizeStatus(d.status),
      url: d.image_url ?? d.video_url ?? d.url ?? undefined,
      error: d.error ?? undefined,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the generation API." },
      { status: 502 }
    );
  }
}