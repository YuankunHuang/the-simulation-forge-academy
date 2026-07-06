# 仿真铸造学院 · The Simulation Forge Academy

> A personal career RPG for becoming a deterministic realtime simulation engineer.
> 一座属于你的职业转型 RPG 学院：从 Unity 生产工程师，到确定性实时仿真基础设施工程师。

这是一个**私人、单机、本地优先**的游戏化职业转型系统。它不是待办清单，不是课程追踪器——它是一个温暖的学院驾驶舱：每天打开它，你就知道自己在哪里、今天做什么、为什么做、做到什么程度算完成、以及产出了什么职业证据。

核心规则：**无证据，无精通 XP（No artifact, no mastery XP）。**

## 功能总览

| 系统 | 说明 |
| --- | --- |
| 炉火大厅 | 米拉导师任务感知问候、职业称号、动量之火、今日推荐任务、三种能量模式 |
| 征程地图 | 主线三幕 + 营地支线 + 战争迷雾：当前区域全开，下一区域剪影，远方藏雾 |
| 工坊（任务详情） | 十六段结构：叙事、目标、概念链、产物清单、执行计划、DoD、证据表单、AI Prompt、常见陷阱、调试笔记、禁止事项、展示种子；核心段常驻、参考段折叠 |
| Boss 之门 | 区域出口答辩：证据齐全 + 亲口讲清才能过门；每门铸一枚之印神器，答辩全文存入日志作面试防线 |
| 证据宝库 | 23 件神器（Common → Legendary），每件附 LinkedIn/博客/作品集/简历/面试建议 |
| 技能树 | 六棵树、证据驱动解锁：先用任务证明，再花技能点点亮 |
| 复习卡组 | 简化间隔重复（四档评分），任务完成后知识卡自动入组 |
| 秘境商店 | 金币购买可选的小型作品集项目（含调试哥布林竞技场等 7 座），永不阻塞主线 |
| 深度冲刺 | 状态好时连推多关，结束生成 Session Recap |
| 篝火日志 | 冒险历史、反思与 Boss 答辩、冲刺回顾、展示草稿、存档导出/导入 |

种子内容：**Unity Native Boundary Lab** 项目的 R0 + M0–M13 全部里程碑、6 座 Boss 之门，以及可选的**生产经验营地**（Act 0 支线，B1–B6：把 5 年 Unity 生产经验变成显性证据）。Act I 全线任务均具备工坊级深度（概念链/产物清单/执行计划/调试笔记/展示种子），但解锁节奏不变：未到达的区域仍按迷雾与 Boss 门控逐步开放，Act II/III 藏于迷雾。

## 快速开始

要求：Node.js 18+（推荐 20+）。

```bash
npm install     # 安装依赖
npm run dev     # 本地开发，默认 http://localhost:5173
```

## 常用命令

```bash
npm run dev        # 开发服务器
npm run build      # TypeScript 检查 + 生产构建（输出到 dist/）
npm run preview    # 本地预览生产构建
npm test           # 运行全部引擎单元测试（Vitest）
npm run test:watch # 测试监听模式
```

## 部署（Cloudflare Workers）

线上部署走 Cloudflare Workers（含静态资源）：`wrangler.toml` 声明 Worker 入口 `worker/index.ts` 与静态目录 `dist/`，KV 命名空间 `SFA_KV` 存放云端存档，Secret `PORTAL_SESSION_SECRET` 用于校验统一门禁 cookie（见下）。推送到 Git 后由 Cloudflare Workers Builds 自动构建部署。

本项目的访问控制不是自己做的，而是接入了姊妹项目 treasure-box（百宝箱）的统一门禁：`worker/index.ts` 在放行任何请求前，都会校验请求里的 `box_session` cookie（`worker/portalAuth.ts`）；没有它，静态资源和 `/api/save` 一律拒绝——页面请求 302 跳去百宝箱补验证，`/api/save` 直接 401。`PORTAL_SESSION_SECRET` 的值必须和百宝箱的 `BOX_PASSPHRASE` 完全一致，两边独立部署、独立设置：

```bash
npx wrangler secret put PORTAL_SESSION_SECRET   # 值需与百宝箱的 BOX_PASSPHRASE 相同
npm run worker:dev                              # 本地联调 Worker（先 build，再 wrangler dev）
```

本地联调前把 `.dev.vars.example` 复制为 `.dev.vars` 并填入同一份口令。

前端构建产物本身仍是纯静态文件（`base: "./"` + HashRouter），理论上也可以脱离 Worker 单独托管到 GitHub Pages / Netlify——但会失去统一门禁与 `/api/save`，云端同步不可用，应用退化为纯本地存档。

## 数据与隐私

- 进度以浏览器 `localStorage` 为主存（键：`sfa-save-v1`），并自动同步到你自己的 Cloudflare KV（单一存档，无账号系统）。
- 访问控制由百宝箱统一门禁在服务端强制执行（见上），本应用自己不再维护任何口令状态；启动时自动对账，云端更新则拉取、本地更新则推送，任何设备打开都是最新进度。
- 无分析埋点、无外部 AI API。
- 在「篝火日志 → 存档」中可导出/导入 JSON 备份，也可手动推送/拉取云端存档。

## 如何编辑内容

全部内容是强类型 TypeScript 数据文件，位于 `src/content/`：

| 文件 | 内容 |
| --- | --- |
| `quests.ts` | 任务（R0、M0–M13、Boss 之门）：叙事、DoD、证据要求、奖励、AI Prompt 等 |
| `campaigns.ts` | 三幕战役与区域（名称、氛围、顺序） |
| `artifacts.ts` | 证据神器与五类展示建议 |
| `skills.ts` | 六棵技能树与节点（证据来源任务） |
| `reviewCards.ts` | 复习卡（问题/答案/关联任务） |
| `bonusDungeons.ts` | 秘境（费用、前置、范围简报） |
| `npcDialogues.ts` | 米拉导师台词库 |

新增一个任务的最小步骤：

1. 在 `quests.ts` 中加一条 `Quest`（`id`、`order`、`regionId`、`prerequisites`、证据要求必填）。
2. 若它产出神器，在 `artifacts.ts` 加对应 `Artifact` 并在任务的 `artifactIds` 引用。
3. 若它提供技能证据，在 `skills.ts` 的对应节点 `sourceQuestIds` 里加上任务 id。
4. 若新增区域/门控，同步 `campaigns.ts` 与 `src/engine/unlockEngine.ts` 中的 `REGION_GATES`。
5. `npm test` 确认解锁链没有断裂。

## 技术栈与结构

React 18 · TypeScript（strict）· Vite 5 · Tailwind CSS 3 · Framer Motion · Zustand（persist）· React Router（Hash）· Vitest。

```
src/
  app/        路由与全局 Provider
  content/    强类型种子内容（纯数据）
  engine/     六个纯函数引擎：unlock / quest / reward / review / evidence / sprint
  features/   按功能划分的页面：hall / map / quests / skills / evidence / review / shop / journal / rewards
  components/ 通用 UI、布局、SVG 图标
  store/      Zustand 存档 + localStorage 持久化 + 导出/导入
  types/      领域模型
  lib/        日期 / id / 格式化工具
  tests/      引擎单元测试 + 内容完整性守卫（74 个用例）
```

架构细节见 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)，版本变更见 [docs/CHANGELOG.md](docs/CHANGELOG.md)。

## 已知限制（MVP）

- Act II / III 只有地图剪影，无任务内容（按设计：完成第一幕公开 demo 后再铸造）。
- 证据均为文本字段（commit hash、截图路径、笔记），不做真实文件上传。
- AI Prompt 为可复制文本，应用本身不调用任何 AI API。
- 秘境是范围简报 + 完成记录，实际动手在应用之外。
- 无 Service Worker（PWA-ready：已含 manifest 与主题色，可离线化作为后续增强）。
