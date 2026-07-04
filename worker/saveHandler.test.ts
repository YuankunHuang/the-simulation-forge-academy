import { describe, expect, it } from "vitest";
import { handleSaveGet, handleSavePut, handleSaveRequest, type SaveEnv } from "./saveHandler";

/**
 * saveHandler 的纯逻辑单测——用一个内存版的假 KVNamespace，不需要真实 Cloudflare 环境。
 * 故意放在 src/ 之外（和 worker/index.ts 一样），避免被主应用的 tsc --noEmit 项目触碰到。
 */

function makeFakeKv() {
  const store = new Map<string, { value: string; metadata?: { savedAt: string } }>();
  return {
    store,
    kv: {
      async getWithMetadata(key: string) {
        const entry = store.get(key);
        return { value: entry?.value ?? null, metadata: entry?.metadata ?? null };
      },
      async put(key: string, value: string, options?: { metadata?: { savedAt: string } }) {
        store.set(key, { value, metadata: options?.metadata });
      },
    } as unknown as SaveEnv["SFA_KV"],
  };
}

function makeEnv(passphrase = "secret") {
  const { kv, store } = makeFakeKv();
  return { env: { SFA_KV: kv, SYNC_PASSPHRASE: passphrase } as SaveEnv, store };
}

describe("handleSaveGet", () => {
  it("口令错误返回 401", async () => {
    const { env } = makeEnv();
    const req = new Request("https://x/api/save", { headers: { "X-Sync-Passphrase": "wrong" } });
    const res = await handleSaveGet(req, env);
    expect(res.status).toBe(401);
  });

  it("云端没有存档返回 404", async () => {
    const { env } = makeEnv();
    const req = new Request("https://x/api/save", { headers: { "X-Sync-Passphrase": "secret" } });
    const res = await handleSaveGet(req, env);
    expect(res.status).toBe(404);
  });

  it("有存档时原样返回 json 与 X-Saved-At", async () => {
    const { env, store } = makeEnv();
    store.set("save", { value: '{"foo":"bar"}', metadata: { savedAt: "2026-07-04T10:00:00.000Z" } });
    const req = new Request("https://x/api/save", { headers: { "X-Sync-Passphrase": "secret" } });
    const res = await handleSaveGet(req, env);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('{"foo":"bar"}');
    expect(res.headers.get("X-Saved-At")).toBe("2026-07-04T10:00:00.000Z");
  });
});

describe("handleSavePut", () => {
  it("口令错误返回 401，不写入", async () => {
    const { env, store } = makeEnv();
    const req = new Request("https://x/api/save", {
      method: "PUT",
      headers: { "X-Sync-Passphrase": "wrong" },
      body: '{"foo":"bar"}',
    });
    const res = await handleSavePut(req, env);
    expect(res.status).toBe(401);
    expect(store.size).toBe(0);
  });

  it("非法 JSON 返回 400，不写入", async () => {
    const { env, store } = makeEnv();
    const req = new Request("https://x/api/save", {
      method: "PUT",
      headers: { "X-Sync-Passphrase": "secret" },
      body: "not json",
    });
    const res = await handleSavePut(req, env);
    expect(res.status).toBe(400);
    expect(store.size).toBe(0);
  });

  it("合法 JSON 写入 KV 并返回 savedAt", async () => {
    const { env, store } = makeEnv();
    const req = new Request("https://x/api/save", {
      method: "PUT",
      headers: { "X-Sync-Passphrase": "secret" },
      body: '{"foo":"bar"}',
    });
    const res = await handleSavePut(req, env);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { savedAt: string };
    expect(typeof body.savedAt).toBe("string");
    expect(store.get("save")?.value).toBe('{"foo":"bar"}');
  });
});

describe("handleSaveRequest", () => {
  it("按方法分发到 GET/PUT，其它方法 405", async () => {
    const { env } = makeEnv();
    const getRes = await handleSaveRequest(
      new Request("https://x/api/save", { headers: { "X-Sync-Passphrase": "secret" } }),
      env,
    );
    expect(getRes.status).toBe(404); // 空存档，但确认走到了 GET 分支

    const deleteRes = await handleSaveRequest(new Request("https://x/api/save", { method: "DELETE" }), env);
    expect(deleteRes.status).toBe(405);
  });
});
