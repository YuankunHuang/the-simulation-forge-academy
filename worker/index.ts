import { isUnlocked } from "./portalAuth";
import { handleSaveRequest, type SaveEnv } from "./saveHandler";

/**
 * Worker 入口 — Cloudflare「统一 Workers（含静态资源）」部署模式。
 * 统一门禁：所有请求先校验百宝箱签发的 box_session cookie（PORTAL_SESSION_SECRET 与
 * treasure-box 的 BOX_PASSPHRASE 是同一份值）——没有它，静态资源和 /api/save 都拿不到。
 * /api/save 走 saveHandler；其它请求（HTML/JS/CSS 等构建产物）转给静态资源绑定 ASSETS。
 * 因为游戏用 HashRouter（路由全在 # 后面，浏览器不会为此单独发请求），
 * 这里不需要处理 SPA 深链回退，wrangler.toml 里的 single-page-application 兜底只是保险。
 */

export interface Env extends SaveEnv {
  ASSETS: Fetcher;
  PORTAL_SESSION_SECRET: string;
}

const BOX_URL = "https://box.yuankunhuang.com/";

function unauthorizedJson(): Response {
  return new Response(JSON.stringify({ error: "未通过百宝箱验证。" }), {
    status: 401,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function redirectToBox(request: Request): Response {
  const next = encodeURIComponent(request.url);
  return Response.redirect(`${BOX_URL}?next=${next}`, 302);
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    const unlocked = await isUnlocked(request, env.PORTAL_SESSION_SECRET);

    if (url.pathname === "/api/save") {
      if (!unlocked) return unauthorizedJson();
      return handleSaveRequest(request, env);
    }

    if (!unlocked) return redirectToBox(request);
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
