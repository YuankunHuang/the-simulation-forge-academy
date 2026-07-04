import { describe, expect, it } from "vitest";
import { QUEST_BY_ID } from "@/content/quests";
import {
  applyRewards,
  artifactsForQuest,
  computeCompletionRewards,
  levelForXp,
  mergeBundles,
  skillsMadeAvailableBy,
  titleForCompleted,
  xpProgress,
} from "@/engine/rewardEngine";

describe("rewardEngine · 等级曲线", () => {
  it("XP 阈值：L1=0, L2=100, L3=300, L4=600", () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(99)).toBe(1);
    expect(levelForXp(100)).toBe(2);
    expect(levelForXp(300)).toBe(3);
    expect(levelForXp(600)).toBe(4);
  });

  it("xpProgress 返回当前等级内进度", () => {
    const p = xpProgress(150);
    expect(p.level).toBe(2);
    expect(p.intoLevel).toBe(50);
    expect(p.needed).toBe(200);
  });
});

describe("rewardEngine · 任务结算", () => {
  const m0 = QUEST_BY_ID.m0;

  it("基础奖励来自任务定义", () => {
    const { bundle } = computeCompletionRewards(m0, {
      commit: "a1b2c3d",
      tree: "native/ unity/ docs/",
      thesis: "边界设计决定 interop 成败。",
      reflection: "短反思",
    });
    expect(bundle.xp).toBe(m0.rewards.xp);
    expect(bundle.gold).toBe(m0.rewards.gold);
    expect(bundle.skillPoints).toBe(m0.rewards.skillPoints);
  });

  it("长反思（≥60 字）获得 +1 洞察，≥200 字获得 +2", () => {
    const short = computeCompletionRewards(m0, { reflection: "短" });
    expect(short.insightBonus).toBe(0);
    const medium = computeCompletionRewards(m0, { reflection: "字".repeat(80) });
    expect(medium.insightBonus).toBe(1);
    const long = computeCompletionRewards(m0, { reflection: "字".repeat(220) });
    expect(long.insightBonus).toBe(2);
  });

  it("充实的展示型证据（doc_section ≥80 字）获得声望加成", () => {
    const withDoc = computeCompletionRewards(m0, { thesis: "论".repeat(100) });
    expect(withDoc.reputationBonus).toBe(5);
    expect(withDoc.bundle.reputation).toBe(m0.rewards.reputation + 5);
  });

  it("applyRewards / mergeBundles 正确累加", () => {
    const wallet = { xp: 10, gold: 20, skillPoints: 1, reputation: 0, insight: 0 };
    const bundle = { xp: 5, gold: 5, skillPoints: 1, reputation: 2, insight: 1 };
    expect(applyRewards(wallet, bundle)).toEqual({ xp: 15, gold: 25, skillPoints: 2, reputation: 2, insight: 1 });
    expect(mergeBundles(bundle, bundle).xp).toBe(10);
  });
});

describe("rewardEngine · 神器与技能", () => {
  it("M7 解锁边界成本报告（Epic）", () => {
    const artifacts = artifactsForQuest("m7");
    expect(artifacts).toHaveLength(1);
    expect(artifacts[0].id).toBe("art_m7");
    expect(artifacts[0].rarity).toBe("epic");
  });

  it("初次信号之门铸成桥村之印（Epic）", () => {
    const artifacts = artifactsForQuest("boss_bridge");
    expect(artifacts).toHaveLength(1);
    expect(artifacts[0].id).toBe("art_boss_bridge");
    expect(artifacts[0].rarity).toBe("epic");
    expect(QUEST_BY_ID.boss_bridge.rewards.xp).toBeGreaterThan(0);
  });

  it("R0 铸成炉火誓约", () => {
    const artifacts = artifactsForQuest("q_r0");
    expect(artifacts.map((a) => a.id)).toEqual(["art_r0"]);
  });

  it("完成 M3 让 RAII 等技能证据就绪", () => {
    const skills = skillsMadeAvailableBy("m3", ["q_r0", "m0", "m1", "m2"]);
    const ids = skills.map((s) => s.id);
    expect(ids).toContain("skill_raii");
    expect(ids).toContain("skill_opaque_handle");
    expect(ids).toContain("skill_idisposable");
  });

  it("已有其他来源证据的技能不重复标记", () => {
    // skill_c_abi 来源为 m1 或 m2：m1 已完成时，完成 m2 不再新增
    const skills = skillsMadeAvailableBy("m2", ["q_r0", "m0", "m1"]);
    expect(skills.map((s) => s.id)).not.toContain("skill_c_abi");
  });
});

describe("rewardEngine · 称号阶梯", () => {
  it("从 Unity 生产工程师一路晋升", () => {
    expect(titleForCompleted([]).titleEn).toBe("Unity Production Engineer");
    expect(titleForCompleted(["q_r0", "m0"]).titleEn).toBe("Boundary Initiate");
    expect(titleForCompleted(["q_r0", "m0", "m1", "m2"]).titleEn).toBe("Native Signal Apprentice");
    expect(titleForCompleted(["q_r0", "m0", "m1", "m2", "m3", "boss_bridge"]).titleEn).toBe("Interop Bridgewright");
  });
});
