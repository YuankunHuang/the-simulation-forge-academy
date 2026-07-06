import { afterEach, describe, expect, it, vi } from "vitest";
import { CloudSyncError, fetchRemoteSave, pushRemoteSave } from "@/lib/cloudSyncApi";
import { summarizeSaveJson } from "@/lib/saveSummary";

/** cloudSyncApi 与 summarizeSaveJson 的纯逻辑单测——全部 mock fetch，不发真实网络请求。 */

function mockFetchOnce(response: Partial<Response> & { text?: () => Promise<string>; json?: () => Promise<unknown> }) {
  const fetchMock = vi.fn().mockResolvedValue(response as Response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchRemoteSave", () => {
  it("请求方法与头部正确，200 时返回原始 json 与 savedAt", async () => {
    const headers = new Map([["X-Saved-At", "2026-07-04T10:00:00.000Z"]]);
    const fetchMock = mockFetchOnce({
      ok: true,
      status: 200,
      text: async () => '{"app":"the-simulation-forge-academy"}',
      headers: { get: (k: string) => headers.get(k) ?? null } as unknown as Headers,
    });

    const result = await fetchRemoteSave();
    expect(fetchMock).toHaveBeenCalledWith("/api/save", expect.objectContaining({ method: "GET" }));
    expect(result.json).toBe('{"app":"the-simulation-forge-academy"}');
    expect(result.savedAt).toBe("2026-07-04T10:00:00.000Z");
  });

  it("401 抛 unauthorized（未通过百宝箱统一门禁）", async () => {
    mockFetchOnce({ ok: false, status: 401, json: async () => ({ error: "未通过百宝箱验证。" }) });
    await expect(fetchRemoteSave()).rejects.toMatchObject({ kind: "unauthorized" });
  });

  it("404 抛 not_found", async () => {
    mockFetchOnce({ ok: false, status: 404, json: async () => ({ error: "云端还没有存档。" }) });
    await expect(fetchRemoteSave()).rejects.toMatchObject({ kind: "not_found" });
  });

  it("网络异常抛 network", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );
    await expect(fetchRemoteSave()).rejects.toMatchObject({ kind: "network" });
  });
});

describe("pushRemoteSave", () => {
  it("PUT 请求带 content-type、body 与 keepalive（鉴权由同源 cookie 自动携带）", async () => {
    const fetchMock = mockFetchOnce({ ok: true, status: 200, json: async () => ({ savedAt: "2026-07-04T10:00:00.000Z" }) });
    const result = await pushRemoteSave('{"foo":"bar"}');
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/save",
      expect.objectContaining({
        method: "PUT",
        headers: { "content-type": "application/json; charset=utf-8" },
        body: '{"foo":"bar"}',
        // 页面卸载时补推依赖 keepalive 才能跑完，这里确认它始终被带上
        keepalive: true,
      }),
    );
    expect(result.savedAt).toBe("2026-07-04T10:00:00.000Z");
  });
});

describe("CloudSyncError", () => {
  it("携带 kind 与友好信息", () => {
    const err = new CloudSyncError("network", "连接云端失败，请检查网络。");
    expect(err.kind).toBe("network");
    expect(err.message).toBe("连接云端失败，请检查网络。");
  });
});

describe("summarizeSaveJson", () => {
  it("解析有效存档 JSON，抽取等级/任务数/导出时间", () => {
    const json = JSON.stringify({
      app: "the-simulation-forge-academy",
      version: 1,
      exportedAt: "2026-07-04T10:00:00.000Z",
      state: {
        wallet: { xp: 300, gold: 0, skillPoints: 0, reputation: 0, insight: 0 },
        questCompletions: { q_r0: {}, m0: {} },
      },
    });
    const summary = summarizeSaveJson(json);
    expect(summary).toEqual({ level: 3, completedCount: 2, exportedAt: "2026-07-04T10:00:00.000Z" });
  });

  it("非法 JSON 返回 null", () => {
    expect(summarizeSaveJson("not json")).toBeNull();
  });

  it("缺少 state 字段返回 null", () => {
    expect(summarizeSaveJson(JSON.stringify({ app: "x" }))).toBeNull();
  });
});
