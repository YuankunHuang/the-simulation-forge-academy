import { describe, expect, it } from "vitest";
import worker, { type Env } from "./index";

/** 与 portalAuth.test.ts 一致的手写签发逻辑，造测试 cookie。 */
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

const SECRET = "shared-secret";

function makeEnv(): Env {
  const assetsFetch = async () => new Response("<html>game shell</html>", { status: 200 });
  return {
    PORTAL_SESSION_SECRET: SECRET,
    SFA_KV: {
      async getWithMetadata() {
        return { value: null, metadata: null };
      },
      async put() {},
    } as unknown as Env["SFA_KV"],
    ASSETS: { fetch: assetsFetch } as unknown as Fetcher,
  };
}

describe("静态资源门禁", () => {
  it("没有有效 cookie 时 302 跳转到百宝箱，并带上原地址作为 next", async () => {
    const res = await worker.fetch(new Request("https://sfa.yuankunhuang.com/journal"), makeEnv());
    expect(res.status).toBe(302);
    const location = res.headers.get("Location") ?? "";
    expect(location.startsWith("https://box.yuankunhuang.com/?next=")).toBe(true);
    expect(decodeURIComponent(location.split("next=")[1])).toBe("https://sfa.yuankunhuang.com/journal");
  });

  it("持有有效 cookie 时放行到 ASSETS", async () => {
    const token = await signToken(SECRET, Math.floor(Date.now() / 1000) + 3600);
    const res = await worker.fetch(
      new Request("https://sfa.yuankunhuang.com/", { headers: { Cookie: `box_session=${token}` } }),
      makeEnv(),
    );
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("game shell");
  });
});

describe("/api/save 门禁", () => {
  it("没有有效 cookie 时返回 401 JSON，不触达 saveHandler", async () => {
    const res = await worker.fetch(new Request("https://sfa.yuankunhuang.com/api/save"), makeEnv());
    expect(res.status).toBe(401);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBeTruthy();
  });

  it("持有有效 cookie 时正常走到 saveHandler（空存档返回 404）", async () => {
    const token = await signToken(SECRET, Math.floor(Date.now() / 1000) + 3600);
    const res = await worker.fetch(
      new Request("https://sfa.yuankunhuang.com/api/save", { headers: { Cookie: `box_session=${token}` } }),
      makeEnv(),
    );
    expect(res.status).toBe(404);
  });
});
