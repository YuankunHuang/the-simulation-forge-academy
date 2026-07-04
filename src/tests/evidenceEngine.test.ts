import { describe, expect, it } from "vitest";
import { ARTIFACT_BY_ID } from "@/content/artifacts";
import { QUEST_BY_ID } from "@/content/quests";
import { showcasePromptsFor, validateEvidence } from "@/engine/evidenceEngine";

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
