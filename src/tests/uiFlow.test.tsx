// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

/**
 * UI 集成冒烟测试 — 走通 Duolingo 式闯关闭环：
 * 路径主页 → 点节点 → 工坊四步 → 提交证据 → 多幕奖励仪式 → 回到路径。
 * 引擎逻辑已有单测覆盖，这里只验证表现层接线正确。
 */

// jsdom 没有 canvas，mock 掉彩带
vi.mock("canvas-confetti", () => ({ default: vi.fn() }));

beforeAll(async () => {
  // 门禁已上移到 Worker 层，App 组件不再关心口令；这里只需 mock 掉云同步网络请求
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init?: RequestInit) =>
      (init?.method === "PUT"
        ? { ok: true, status: 200, json: async () => ({ savedAt: new Date().toISOString() }) }
        : { ok: false, status: 404, json: async () => ({ error: "云端还没有存档。" }) }) as unknown as Response,
    ),
  );
  // jsdom 缺失的浏览器 API
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
  window.requestAnimationFrame ??= ((cb: FrameRequestCallback) =>
    window.setTimeout(() => cb(performance.now()), 16)) as typeof window.requestAnimationFrame;
  window.cancelAnimationFrame ??= ((id: number) => window.clearTimeout(id)) as typeof window.cancelAnimationFrame;
  Element.prototype.scrollIntoView = () => {};
  window.scrollTo = (() => {}) as typeof window.scrollTo;
  // framer-motion whileInView 依赖 IntersectionObserver
  class IO {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  (globalThis as Record<string, unknown>).IntersectionObserver ??= IO;
  localStorage.clear();
});

afterAll(() => {
  cleanup();
});

describe("闯关闭环", () => {
  it("路径 → 工坊四步 → 提交证据 → 奖励仪式 → 回到路径（节点变金）", async () => {
    const { default: App } = await import("@/app/App");
    render(<App />);

    // ① 路径主页：R0 是当前节点
    const node = await screen.findByRole("button", { name: /R0 点燃炉火/ });
    fireEvent.click(node);

    // ② popover 出现 → 开始任务
    const start = await screen.findByRole("button", { name: /开始任务/ });
    fireEvent.click(start);

    // ③ 工坊步骤 1：简报
    await screen.findByText("为什么重要");
    fireEvent.click(screen.getByRole("button", { name: /继续/ }));

    // 步骤 2：作战计划（DoD 常驻）
    await screen.findByText(/完成的定义/);
    fireEvent.click(screen.getByRole("button", { name: /继续/ }));

    // 步骤 3：装备（AI Prompt）
    await screen.findByText(/AI Skill \/ Cursor Prompt/);
    fireEvent.click(screen.getByRole("button", { name: /继续/ }));

    // 步骤 4：提交证据
    const intention = await screen.findByLabelText(/一句话意图/);
    fireEvent.change(intention, { target: { value: "我正在成为确定性仿真工程师。" } });
    const project = screen.getByLabelText(/当前主线项目/);
    fireEvent.change(project, { target: { value: "Unity Native Boundary Lab" } });

    const submit = screen.getByRole("button", { name: /提交证据，完成任务/ }) as HTMLButtonElement;
    expect(submit.disabled).toBe(false);
    fireEvent.click(submit);

    // ④ 奖励仪式：胜利幕 → 神器幕 → 战果幕
    await screen.findByText("任务完成");
    fireEvent.click(screen.getByRole("button", { name: /继续/ }));
    await screen.findByText(/新证据入库/);
    fireEvent.click(screen.getByRole("button", { name: /继续/ }));
    await screen.findByText("战果清点");

    // ⑤ 回到路径：R0 已完成，M0 成为当前节点（仪式层与身后的工坊页都有「回到路径」，限定在仪式内点）
    const ceremonyDialog = screen.getByRole("dialog", { name: "任务完成奖励" });
    fireEvent.click(within(ceremonyDialog).getByRole("button", { name: /回到路径/ }));
    await screen.findByRole("button", { name: /M0 .*/ });

    const { usePlayerStore } = await import("@/store/playerStore");
    const state = usePlayerStore.getState();
    expect(Object.keys(state.questCompletions)).toContain("q_r0");
    expect(state.wallet.xp).toBeGreaterThan(0);
  });
});
