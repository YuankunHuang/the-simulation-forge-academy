// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCloudSyncStore } from "@/store/cloudSyncStore";
import { usePlayerStore } from "@/store/playerStore";
import { buildExportPayload, createInitialPlayerState } from "@/store/persistence";

/**
 * reconcileOnStartup 的分支单测 — 全部 mock fetch。
 * 核心约定：云端 savedAt 比本地 lastLocalChangeAt 新 → 拉取；旧 → 推送；
 * 404 → 推送；本地基准未知时仅全新存档才拉取。
 */

const T_OLD = "2026-07-01T00:00:00.000Z";
const T_NEW = "2026-07-05T00:00:00.000Z";

/** 造一份合法的云端存档 JSON，带可辨识的玩家名。 */
function remoteSaveJson(playerName: string): string {
  const state = { ...createInitialPlayerState(), playerName };
  return JSON.stringify(buildExportPayload(state));
}

interface FetchCall {
  method: string;
}

/** mock /api/save：GET 返回给定存档（或 404），PUT 永远成功。 */
function stubSaveApi(options: { getStatus: 200 | 404; json?: string; savedAt?: string }) {
  const calls: FetchCall[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init?: RequestInit) => {
      const method = init?.method ?? "GET";
      calls.push({ method });
      if (method === "PUT") {
        return { ok: true, status: 200, json: async () => ({ savedAt: T_NEW }) } as unknown as Response;
      }
      if (options.getStatus === 404) {
        return { ok: false, status: 404, json: async () => ({ error: "云端还没有存档。" }) } as unknown as Response;
      }
      return {
        ok: true,
        status: 200,
        text: async () => options.json ?? "{}",
        headers: { get: (k: string) => (k === "X-Saved-At" ? (options.savedAt ?? null) : null) },
      } as unknown as Response;
    }),
  );
  return calls;
}

beforeEach(() => {
  usePlayerStore.setState({ ...createInitialPlayerState(), ceremony: null });
  useCloudSyncStore.setState({
    autoSyncEnabled: true,
    lastSyncedAt: null,
    lastLocalChangeAt: null,
    lastError: null,
    status: "idle",
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("reconcileOnStartup", () => {
  it("云端比本地新 → 自动拉取覆盖本机，并对齐时间基准", async () => {
    useCloudSyncStore.setState({ lastLocalChangeAt: T_OLD });
    stubSaveApi({ getStatus: 200, json: remoteSaveJson("云端铸造者"), savedAt: T_NEW });

    const result = await useCloudSyncStore.getState().reconcileOnStartup();

    expect(result.action).toBe("pulled");
    expect(usePlayerStore.getState().playerName).toBe("云端铸造者");
    expect(useCloudSyncStore.getState().lastLocalChangeAt).toBe(T_NEW);
    expect(useCloudSyncStore.getState().lastSyncedAt).toBe(T_NEW);
  });

  it("本地比云端新 → 推送补齐云端", async () => {
    useCloudSyncStore.setState({ lastLocalChangeAt: T_NEW });
    const calls = stubSaveApi({ getStatus: 200, json: remoteSaveJson("旧的云端"), savedAt: T_OLD });

    const result = await useCloudSyncStore.getState().reconcileOnStartup();

    expect(result.action).toBe("pushed");
    expect(calls.some((c) => c.method === "PUT")).toBe(true);
    // 本机进度未被云端旧存档覆盖
    expect(usePlayerStore.getState().playerName).toBe("铸造者");
  });

  it("云端与本地时间一致 → 什么都不做", async () => {
    useCloudSyncStore.setState({ lastLocalChangeAt: T_NEW });
    const calls = stubSaveApi({ getStatus: 200, json: remoteSaveJson("云端"), savedAt: T_NEW });

    const result = await useCloudSyncStore.getState().reconcileOnStartup();

    expect(result.action).toBe("none");
    expect(calls.every((c) => c.method === "GET")).toBe(true);
    expect(usePlayerStore.getState().playerName).toBe("铸造者");
  });

  it("云端 404（还没有存档）→ 推送本机建立云端基准", async () => {
    const calls = stubSaveApi({ getStatus: 404 });

    const result = await useCloudSyncStore.getState().reconcileOnStartup();

    expect(result.action).toBe("pushed");
    expect(calls.some((c) => c.method === "PUT")).toBe(true);
  });

  it("本地基准未知且本机是全新存档 → 拉取云端", async () => {
    stubSaveApi({ getStatus: 200, json: remoteSaveJson("云端铸造者"), savedAt: T_NEW });

    const result = await useCloudSyncStore.getState().reconcileOnStartup();

    expect(result.action).toBe("pulled");
    expect(usePlayerStore.getState().playerName).toBe("云端铸造者");
  });

  it("本地基准未知但本机已有进度 → 按兵不动（不推不拉）", async () => {
    usePlayerStore.setState({
      questCompletions: { q_r0: { questId: "q_r0", completedAt: T_OLD, evidence: {} } },
    });
    const calls = stubSaveApi({ getStatus: 200, json: remoteSaveJson("云端"), savedAt: T_NEW });

    const result = await useCloudSyncStore.getState().reconcileOnStartup();

    expect(result.action).toBe("none");
    expect(calls.every((c) => c.method === "GET")).toBe(true);
    expect(Object.keys(usePlayerStore.getState().questCompletions)).toContain("q_r0");
  });

  it("网络失败 → 记录错误且不动本机进度", async () => {
    useCloudSyncStore.setState({ lastLocalChangeAt: T_OLD });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    const result = await useCloudSyncStore.getState().reconcileOnStartup();

    expect(result.action).toBe("none");
    expect(result.error).toBeTruthy();
    expect(useCloudSyncStore.getState().status).toBe("error");
  });
});

describe("推拉后的时间基准对齐", () => {
  it("pushNow 成功后 lastLocalChangeAt 对齐到服务器 savedAt", async () => {
    stubSaveApi({ getStatus: 404 });
    const result = await useCloudSyncStore.getState().pushNow();
    expect(result.ok).toBe(true);
    expect(useCloudSyncStore.getState().lastLocalChangeAt).toBe(T_NEW);
  });

  it("markLocalChange 更新本地时间基准", () => {
    expect(useCloudSyncStore.getState().lastLocalChangeAt).toBeNull();
    useCloudSyncStore.getState().markLocalChange();
    expect(useCloudSyncStore.getState().lastLocalChangeAt).not.toBeNull();
  });
});
