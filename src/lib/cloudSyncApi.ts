/**
 * 云端存档 API 客户端 — 对接 Cloudflare Worker 的 `/api/save`。
 * 与游戏同源部署，没有跨域问题；鉴权由浏览器自动携带的百宝箱统一门禁 cookie 完成
 * （worker/index.ts 在转发到这里之前已经校验过，未授权请求根本到不了这一层）。
 */

export type CloudSyncErrorKind = "unauthorized" | "not_found" | "invalid" | "network";

export class CloudSyncError extends Error {
  kind: CloudSyncErrorKind;
  constructor(kind: CloudSyncErrorKind, message: string) {
    super(message);
    this.kind = kind;
    this.name = "CloudSyncError";
  }
}

async function errorFromResponse(res: Response): Promise<CloudSyncError> {
  if (res.status === 401) return new CloudSyncError("unauthorized", "未通过百宝箱验证。");
  if (res.status === 404) return new CloudSyncError("not_found", "云端还没有存档。");
  let detail = "";
  try {
    const body = (await res.json()) as { error?: string };
    detail = body.error ?? "";
  } catch {
    // 响应体不是 JSON 也无所谓，用状态码兜底
  }
  return new CloudSyncError("invalid", detail || `请求失败（HTTP ${res.status}）。`);
}

export interface RemoteSave {
  /** exportSave() 产出的原始 JSON 字符串，未解析 */
  json: string;
  /** 服务器记录的写入时间（ISO），可能为空 */
  savedAt: string | null;
}

/** 拉取云端存档；不存在抛 CloudSyncError("not_found")，未授权抛 "unauthorized"。 */
export async function fetchRemoteSave(): Promise<RemoteSave> {
  let res: Response;
  try {
    res = await fetch("/api/save", { method: "GET" });
  } catch {
    throw new CloudSyncError("network", "连接云端失败，请检查网络。");
  }
  if (!res.ok) throw await errorFromResponse(res);
  const json = await res.text();
  return { json, savedAt: res.headers.get("X-Saved-At") };
}

export interface PushResult {
  savedAt: string;
}

/** 推送本机存档到云端，覆盖远程当前内容。 */
export async function pushRemoteSave(json: string): Promise<PushResult> {
  let res: Response;
  try {
    res = await fetch("/api/save", {
      method: "PUT",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: json,
    });
  } catch {
    throw new CloudSyncError("network", "连接云端失败，请检查网络。");
  }
  if (!res.ok) throw await errorFromResponse(res);
  return (await res.json()) as PushResult;
}
