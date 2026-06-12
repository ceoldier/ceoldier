import type { JobStatus, MediaKind } from "@/types";

interface GenerateResponse {
  id: string;
}

interface StatusResponse {
  id: string;
  status: JobStatus;
  url?: string;
  error?: string;
}

async function parseOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) detail = body.error;
    } catch {
      /* keep default detail */
    }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

export async function startGeneration(
  kind: MediaKind,
  prompt: string
): Promise<GenerateResponse> {
  const res = await fetch(`/api/${kind}s/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  return parseOrThrow<GenerateResponse>(res);
}

export async function getStatus(
  kind: MediaKind,
  id: string
): Promise<StatusResponse> {
  const res = await fetch(
    `/api/${kind}s/status?id=${encodeURIComponent(id)}`,
    { cache: "no-store" }
  );
  return parseOrThrow<StatusResponse>(res);
}

/**
 * Poll a job until it completes or fails.
 * Images poll every 2s, videos every 4s. Hard timeout: 10 minutes.
 */
export async function pollUntilDone(
  kind: MediaKind,
  id: string,
  onTick?: (status: JobStatus) => void
): Promise<StatusResponse> {
  const interval = kind === "image" ? 2000 : 4000;
  const deadline = Date.now() + 10 * 60 * 1000;

  while (Date.now() < deadline) {
    const status = await getStatus(kind, id);
    onTick?.(status.status);
    if (status.status === "completed" || status.status === "failed") {
      return status;
    }
    await new Promise((r) => setTimeout(r, interval));
  }
  throw new Error("Generation timed out after 10 minutes.");
}
