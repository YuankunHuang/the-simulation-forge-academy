import { describe, expect, it } from "vitest";
import { QUEST_BY_ID } from "@/content/quests";
import { canCompleteQuest, getNextQuest, getRecommendedQuest } from "@/engine/questEngine";
import { addQuestToSprint, buildRecap, createSprint } from "@/engine/sprintEngine";

describe("questEngine · 今日推荐", () => {
  it("新玩家推荐 R0 点燃炉火", () => {
    expect(getRecommendedQuest([])?.id).toBe("q_r0");
  });

  it("推荐跟随主线推进", () => {
    expect(getRecommendedQuest(["q_r0"])?.id).toBe("m0");
    expect(getRecommendedQuest(["q_r0", "m0", "m1", "m2", "m3"])?.id).toBe("boss_bridge");
  });

  it("可选任务（M13）只在主线清空后推荐", () => {
    const beforeM13 = [
      "q_r0", "m0", "m1", "m2", "m3", "boss_bridge",
      "m4", "m5", "m6", "m7", "m8", "boss_benchmark",
      "m9", "boss_layout", "m10", "boss_safety",
      "m11", "boss_package", "m12", "boss_mobile",
    ];
    expect(getRecommendedQuest(beforeM13)?.id).toBe("m13");
    expect(getRecommendedQuest([...beforeM13, "m13"])).toBeNull();
  });
});

describe("questEngine · 完成资格", () => {
  it("证据不全时不可完成", () => {
    const result = canCompleteQuest(QUEST_BY_ID.q_r0, [], { manifesto: "宣言宣言" });
    expect(result.ok).toBe(false);
    expect(result.reasons.some((r) => r.includes("缺少证据"))).toBe(true);
  });

  it("锁定任务即使证据齐全也不可完成（防跳级）", () => {
    const m4 = QUEST_BY_ID.m4;
    const fields = { commit: "abc1234", cpp_assert: "code", cs_check: "code", blittable_explain: "解释" };
    const result = canCompleteQuest(m4, ["q_r0", "m0", "m1", "m2", "m3"], fields);
    expect(result.ok).toBe(false);
    expect(result.reasons.some((r) => r.includes("区域"))).toBe(true);
  });

  it("状态可接且证据齐全时可完成", () => {
    const result = canCompleteQuest(QUEST_BY_ID.q_r0, [], {
      manifesto: "现在的我 / 要成为的我 / 信条",
      weekly_time: "每晚 1 小时",
    });
    expect(result.ok).toBe(true);
  });
});

describe("sprintEngine · 深度冲刺", () => {
  it("冲刺累计任务、神器与奖励，回顾给出下一步", () => {
    let sprint = createSprint("2026-07-03T10:00:00.000Z");
    sprint = addQuestToSprint(sprint, "q_r0", [], { xp: 40, gold: 40, skillPoints: 0, reputation: 0, insight: 0 });
    sprint = addQuestToSprint(sprint, "m0", ["art_m0"], { xp: 80, gold: 60, skillPoints: 2, reputation: 5, insight: 1 });

    expect(sprint.questIds).toEqual(["q_r0", "m0"]);
    expect(sprint.totals.xp).toBe(120);
    expect(sprint.artifactIds).toEqual(["art_m0"]);

    const recap = buildRecap(sprint, "2026-07-03T13:00:00.000Z", ["q_r0", "m0"]);
    expect(recap.questIds).toEqual(["q_r0", "m0"]);
    expect(recap.nextQuestId).toBe("m1");
    expect(recap.nextRisk).toBe(QUEST_BY_ID.m0.nextRisk);
    expect(recap.showcaseSuggestions.length).toBeGreaterThan(0);
  });

  it("继续冒险指向下一个可接任务", () => {
    expect(getNextQuest(["q_r0"], "q_r0")?.id).toBe("m0");
    expect(getNextQuest(["q_r0", "m0"], "m0")?.id).toBe("m1");
  });
});
