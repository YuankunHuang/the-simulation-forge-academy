/**
 * 存档读写的核心逻辑 — 与 Worker 入口分开，方便单测（传入一个假的 KVNamespace 即可，不需要真实 Cloudflare 环境）。
 * 存储：固定一个 key（SAVE_KEY），值就是前端 exportSave() 产出的原始 JSON 字符串；
 * 本模块不解析、不理解其结构，只做搬运，避免和前端存档格式耦合。
 * 鉴权：单一共享口令（环境变量 SYNC_PASSPHRASE），个人工具级别，不是账号系统。
 */

export interface SaveEnv {
  SFA_KV: KVNamespace;
  SYNC_PASSPHRASE: string;
}

const SAVE_KEY = "save";

function jsonResponse(body: unknown, status: number, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...extraHeaders },
  });
}

function checkPassphrase(request: Request, env: SaveEnv): boolean {
  const provided = request.headers.get("X-Sync-Passphrase") ?? "";
  return !!env.SYNC_PASSPHRASE && provided === env.SYNC_PASSPHRASE;
}

export async function handleSaveGet(request: Request, env: SaveEnv): Promise<Response> {
  if (!checkPassphrase(request, env)) return jsonResponse({ error: "口令不正确。" }, 401);

  const { value, metadata } = await env.SFA_KV.getWithMetadata<{ savedAt: string }>(SAVE_KEY, "text");
  if (value === null) return jsonResponse({ error: "云端还没有存档。" }, 404);

  return new Response(value, {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "X-Saved-At": metadata?.savedAt ?? "",
    },
  });
}

export async function handleSavePut(request: Request, env: SaveEnv): Promise<Response> {
  if (!checkPassphrase(request, env)) return jsonResponse({ error: "口令不正确。" }, 401);

  const body = await request.text();
  if (!body || body.length > 2_000_000) {
    return jsonResponse({ error: "存档内容为空或过大。" }, 400);
  }
  // 存档内容本身不需要理解，但至少确认它是合法 JSON，防止写入垃圾数据。
  try {
    JSON.parse(body);
  } catch {
    return jsonResponse({ error: "存档内容不是合法 JSON。" }, 400);
  }

  const savedAt = new Date().toISOString();
  await env.SFA_KV.put(SAVE_KEY, body, { metadata: { savedAt } });
  return jsonResponse({ savedAt }, 200);
}

/** /api/save 的方法分发；非 GET/PUT 返回 405。 */
export async function handleSaveRequest(request: Request, env: SaveEnv): Promise<Response> {
  if (request.method === "GET") return handleSaveGet(request, env);
  if (request.method === "PUT") return handleSavePut(request, env);
  return jsonResponse({ error: "不支持的方法。" }, 405, { Allow: "GET, PUT" });
}
