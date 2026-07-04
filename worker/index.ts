import { handleSaveRequest, type SaveEnv } from "./saveHandler";

/**
 * Worker 入口 — Cloudflare「统一 Workers（含静态资源）」部署模式。
 * /api/save 交给 saveHandler；其它请求（HTML/JS/CSS 等构建产物）转给静态资源绑定 ASSETS。
 * 因为游戏用 HashRouter（路由全在 # 后面，浏览器不会为此单独发请求），
 * 这里不需要处理 SPA 深链回退，wrangler.toml 里的 single-page-application 兜底只是保险。
 */

export interface Env extends SaveEnv {
  ASSETS: Fetcher;
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/save") {
      return handleSaveRequest(request, env);
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
