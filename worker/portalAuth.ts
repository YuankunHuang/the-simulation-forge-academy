/**
 * 百宝箱统一门禁的校验半边 —— 与 treasure-box/src/auth.ts 的签发逻辑对应，独立维护
 * （两个项目各自独立部署，不共享包）。只负责“这个请求带的 box_session cookie 是否有效”，
 * 不负责签发（签发只在百宝箱那边发生）。
 */

export const COOKIE_NAME = "box_session";
const encoder = new TextEncoder();

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
}

function fromBase64Url(text: string): Uint8Array | null {
  try {
    const b64 = text.replaceAll("-", "+").replaceAll("_", "/");
    return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

export async function verifySessionToken(
  token: string,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): Promise<boolean> {
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const expires = token.slice(0, dot);
  const signature = fromBase64Url(token.slice(dot + 1));
  if (!signature || !/^\d+$/.test(expires) || Number(expires) <= nowSeconds) return false;
  const key = await importHmacKey(secret);
  return crypto.subtle.verify("HMAC", key, signature, encoder.encode(expires));
}

export function readSessionToken(request: Request): string | null {
  const cookies = request.headers.get("Cookie") ?? "";
  for (const part of cookies.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === COOKIE_NAME) return rest.join("=") || null;
  }
  return null;
}

/** 请求是否持有一枚由百宝箱签发、且仍在有效期内的会话 cookie。 */
export async function isUnlocked(request: Request, secret: string): Promise<boolean> {
  if (!secret) return false;
  const token = readSessionToken(request);
  if (!token) return false;
  return verifySessionToken(token, secret);
}
