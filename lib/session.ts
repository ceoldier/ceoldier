const COOKIE = "ceoldier_access";

async function hmac(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret + "::ceoldier-v2"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value)
  );
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function makeSession(code: string): Promise<string> {
  const secret = process.env.ACCESS_CODE ?? "";
  return `${code}.${await hmac(code, secret)}`;
}

/** Returns the code if the cookie is valid, else null. */
export async function verifySession(
  cookieValue: string | undefined
): Promise<string | null> {
  if (!cookieValue) return null;
  const dot = cookieValue.lastIndexOf(".");
  if (dot < 1) return null;
  const code = cookieValue.slice(0, dot);
  const sig = cookieValue.slice(dot + 1);
  const secret = process.env.ACCESS_CODE ?? "";
  const expected = await hmac(code, secret);
  return sig === expected ? code : null;
}

export const SESSION_COOKIE = COOKIE;
