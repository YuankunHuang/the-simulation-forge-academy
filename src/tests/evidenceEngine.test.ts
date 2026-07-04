import { describe, expect, it } from "vitest";
import { ARTIFACT_BY_ID } from "@/content/artifacts";
import { QUEST_BY_ID } from "@/content/quests";
import {
  assembleDefenseText,
  defenseDrillPrompt,
  showcasePromptsFor,
  validateEvidence,
} from "@/engine/evidenceEngine";

describe("evidenceEngine · 证据校验（无证据，无精通 XP）", () => {
  const m0 = QUEST_BY_ID.m0;

  it("空表单：全部必填项缺失", () => {
    const result = validateEvidence(m0, {});
    expect(result.ok).toBe(false);
    expect(result.missing.length).toBe(m0.evidenceRequired.filter((e) => !e.optional).length);
  });

  it("空白字符不算有效证据", () => {
    const result = validateEvidence(m0, { commit: "   ", tree: "\n\n", thesis: " ", reflection: " " });
    expect(result.ok).toBe(false);
  });

  it("commit hash 至少 6 个字符", () => {
    const short = validateEvidence(m0, { commit: "a1b", tree: "t", thesis: "t", reflection: "r" });
    expect(short.ok).toBe(false);
    expect(short.missing).toContain("Commit Hash");
    const good = validateEvidence(m0, { commit: "a1b2c3d", tree: "t", thesis: "t", reflection: "r" });
    expect(good.ok).toBe(true);
  });

  it("可选字段缺失不阻塞完成（M1 的失败记录可选）", () => {
    const m1 = QUEST_BY_ID.m1;
    const result = validateEvidence(m1, {
      commit: "abc1234",
      build_log: "构建成功",
      debug_release: "Debug 带符号，Release 开优化",
    });
    expect(result.ok).toBe(true);
  });
});

describe("evidenceEngine · Boss 答辩", () => {
  const boss = QUEST_BY_ID.boss_bridge;

  it("单题演练 Prompt 包含题目与任务上下文，且要求 AI 先听后问", () => {
    const req = boss.evidenceRequired.find((r) => r.id === "why_c_abi")!;
    const prompt = defenseDrillPrompt(boss, req);
    expect(prompt).toContain(req.label);
    expect(prompt).toContain(boss.code);
    expect(prompt).toContain(boss.title);
    expect(prompt).toContain("不要打断");
  });

  it("assembleDefenseText 按题目顺序拼装非空作答，跳过空题", () => {
    const text = assembleDefenseText(boss, {
      summary: "五句总结。",
      why_c_abi: "因为 C ABI 稳定。",
      why_opaque: "   ", // 空白不入档
    });
    expect(text).toContain("【Bridge Village 五句总结】\n五句总结。");
    expect(text).toContain("【① 为什么用 C ABI？】\n因为 C ABI 稳定。");
    expect(text).not.toContain("opaque handle？】");
    // 顺序：总结在前，问题一在后
    expect(text.indexOf("五句总结")).toBeLessThan(text.indexOf("C ABI 稳定"));
  });

  it("全空作答拼装为空字符串（store 不写空日志）", () => {
    expect(assembleDefenseText(boss, {})).toBe("");
  });
});

describe("evidenceEngine · 展示建议生成", () => {
  it("为神器生成全部五类展示内容", () => {
    const prompts = showcasePromptsFor(ARTIFACT_BY_ID.art_m7);
    expect(prompts.linkedin).toContain("LinkedIn");
    expect(prompts.blog).toContain("大纲");
    expect(prompts.resume.length).toBeGreaterThan(10);
    expect(prompts.portfolio.length).toBeGreaterThan(5);
    expect(prompts.interview.length).toBeGreaterThan(5);
  });
});
