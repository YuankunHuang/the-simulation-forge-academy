import { describe, expect, it } from "vitest";
import { COOKIE_NAME, isUnlocked, readSessionToken, verifySessionToken } from "./portalAuth";

/**
 * portalAuth 只负责校验，这里用手写的 HMAC 签发逻辑造测试令牌
 * （与 treasure-box/src/auth.ts 的签发算法保持一致：<过期时间戳>.<base64url(HMAC-SHA256(时间戳))>）。
 */

const SECRET = "shared-secret";

async function signToken(secret: string, expiresAtSeconds: number): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const expires = String(expiresAtSeconds);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(expires));
  const b64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
  return `${expires}.${b64}`;
}

describe("verifySessionToken", () => {
  it("未过期且签名正确 -> true", async () => {
    const token = await signToken(SECRET, Math.floor(Date.now() / 1000) + 3600);
    expect(await verifySessionToken(token, SECRET)).toBe(true);
  });

  it("密钥不一致 -> false", async () => {
    const token = await signToken(SECRET, Math.floor(Date.now() / 1000) + 3600);
    expect(await verifySessionToken(token, "other-secret")).toBe(false);
  });

  it("已过期 -> false", async () => {
    const token = await signToken(SECRET, Math.floor(Date.now() / 1000) - 10);
    expect(await verifySessionToken(token, SECRET)).toBe(false);
  });

  it("格式非法 -> false", async () => {
    expect(await verifySessionToken("garbage", SECRET)).toBe(false);
  });
});

describe("readSessionToken", () => {
  it("从 Cookie 头取出对应字段", () => {
    const req = new Request("https://sfa.yuankunhuang.com/", {
      headers: { Cookie: `a=1; ${COOKIE_NAME}=xyz; b=2` },
    });
    expect(readSessionToken(req)).toBe("xyz");
  });

  it("没有该 cookie 时返回 null", () => {
    const req = new Request("https://sfa.yuankunhuang.com/", { headers: { Cookie: "a=1" } });
    expect(readSessionToken(req)).toBeNull();
  });
});

describe("isUnlocked", () => {
  it("持有有效 cookie -> true", async () => {
    const token = await signToken(SECRET, Math.floor(Date.now() / 1000) + 3600);
    const req = new Request("https://sfa.yuankunhuang.com/", { headers: { Cookie: `${COOKIE_NAME}=${token}` } });
    expect(await isUnlocked(req, SECRET)).toBe(true);
  });

  it("没有 cookie -> false", async () => {
    const req = new Request("https://sfa.yuankunhuang.com/");
    expect(await isUnlocked(req, SECRET)).toBe(false);
  });

  it("secret 未配置（空字符串）时始终 false，不误放行", async () => {
    const token = await signToken(SECRET, Math.floor(Date.now() / 1000) + 3600);
    const req = new Request("https://sfa.yuankunhuang.com/", { headers: { Cookie: `${COOKIE_NAME}=${token}` } });
    expect(await isUnlocked(req, "")).toBe(false);
  });
});
