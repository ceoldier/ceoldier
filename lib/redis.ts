const URL_ =
  process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const TOKEN =
  process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

async function cmd(parts: (string | number)[]): Promise<unknown> {
  if (!URL_ || !TOKEN) throw new Error("Redis env vars missing.");
  const res = await fetch(`${URL_}/${parts.map(String).map(encodeURIComponent).join("/")}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: "no-store",
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? "Redis error");
  return body.result;
}

export async function getBalance(code: string): Promise<number | null> {
  const v = await cmd(["GET", `code:${code}`]);
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function setBalance(code: string, credits: number): Promise<void> {
  await cmd(["SET", `code:${code}`, Math.max(0, Math.floor(credits))]);
}

export async function spend(code: string, amount: number): Promise<number> {
  const n = Number(await cmd(["DECRBY", `code:${code}`, amount]));
  if (n < 0) {
    await cmd(["INCRBY", `code:${code}`, amount]); // refund overdraft
    throw new Error("OUT_OF_CREDITS");
  }
  return n;
}

export async function deleteCode(code: string): Promise<void> {
  await cmd(["DEL", `code:${code}`]);
}
