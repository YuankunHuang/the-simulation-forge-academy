import { describe, expect, it } from "vitest";
import { ARTIFACTS, ARTIFACT_BY_ID } from "@/content/artifacts";
import { BONUS_DUNGEONS } from "@/content/bonusDungeons";
import { CAMPAIGNS, REGION_BY_ID, REGIONS } from "@/content/campaigns";
import { NPC_DIALOGUES } from "@/content/npcDialogues";
import { QUESTS, QUEST_BY_ID } from "@/content/quests";
import { REVIEW_CARDS } from "@/content/reviewCards";
import { SKILL_BY_ID, SKILL_NODES } from "@/content/skills";

/**
 * 内容完整性 — 数据驱动世界的引用一致性守卫：
 * 任何一条断链（任务引用不存在的技能/神器/区域）都应在 CI 阶段暴露。
 */

describe("内容完整性 · 任务引用", () => {
  it("任务 id 唯一", () => {
    const ids = QUESTS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("每个任务的区域存在", () => {
    for (const quest of QUESTS) {
      expect(REGION_BY_ID[quest.regionId], `${quest.id} 的区域 ${quest.regionId}`).toBeDefined();
    }
  });

  it("每个任务的前置任务存在", () => {
    for (const quest of QUESTS) {
      for (const pid of quest.prerequisites) {
        expect(QUEST_BY_ID[pid], `${quest.id} 的前置 ${pid}`).toBeDefined();
      }
    }
  });

  it("每个任务引用的技能节点存在", () => {
    for (const quest of QUESTS) {
      for (const sid of quest.skills) {
        expect(SKILL_BY_ID[sid], `${quest.id} 的技能 ${sid}`).toBeDefined();
      }
    }
  });

  it("每个任务引用的神器存在，且神器 sourceQuestId 回指正确", () => {
    for (const quest of QUESTS) {
      for (const aid of quest.artifactIds) {
        const artifact = ARTIFACT_BY_ID[aid];
        expect(artifact, `${quest.id} 的神器 ${aid}`).toBeDefined();
        expect(artifact.sourceQuestId).toBe(quest.id);
      }
    }
  });

  it("每件神器的来源任务存在", () => {
    for (const artifact of ARTIFACTS) {
      expect(QUEST_BY_ID[artifact.sourceQuestId], `${artifact.id} 的来源 ${artifact.sourceQuestId}`).toBeDefined();
    }
  });

  it("每张复习卡的来源任务与技能存在", () => {
    for (const card of REVIEW_CARDS) {
      expect(QUEST_BY_ID[card.questId], `${card.id} 的任务 ${card.questId}`).toBeDefined();
      if (card.skillId) {
        expect(SKILL_BY_ID[card.skillId], `${card.id} 的技能 ${card.skillId}`).toBeDefined();
      }
    }
  });

  it("每个技能节点的证据来源任务存在", () => {
    for (const node of SKILL_NODES) {
      for (const qid of node.sourceQuestIds) {
        expect(QUEST_BY_ID[qid], `${node.id} 的来源 ${qid}`).toBeDefined();
      }
    }
  });

  it("每座秘境的前置任务存在", () => {
    for (const dungeon of BONUS_DUNGEONS) {
      for (const qid of dungeon.prerequisiteQuestIds) {
        expect(QUEST_BY_ID[qid], `${dungeon.id} 的前置 ${qid}`).toBeDefined();
      }
    }
  });

  it("每个区域归属的战役存在，战役区域表与区域定义一致", () => {
    const campaignIds = new Set(CAMPAIGNS.map((c) => c.id));
    for (const region of REGIONS) {
      expect(campaignIds.has(region.actId), `${region.id} 的战役 ${region.actId}`).toBe(true);
    }
    for (const campaign of CAMPAIGNS) {
      for (const rid of campaign.regionIds) {
        expect(REGION_BY_ID[rid], `${campaign.id} 的区域 ${rid}`).toBeDefined();
      }
    }
  });

  it("quest_focus 台词绑定的任务存在", () => {
    for (const d of NPC_DIALOGUES.filter((d) => d.context === "quest_focus")) {
      expect(d.questId, `${d.id} 缺少 questId`).toBeDefined();
      expect(QUEST_BY_ID[d.questId!], `${d.id} 的任务 ${d.questId}`).toBeDefined();
    }
  });
});

describe("内容完整性 · 基础弧线深度（R0–M3 + Boss）", () => {
  const FOUNDATION = ["q_r0", "m0", "m1", "m2", "m3", "boss_bridge"];

  it("基础弧线任务包含全部深度字段", () => {
    for (const id of FOUNDATION) {
      const quest = QUEST_BY_ID[id];
      expect(quest.conceptMap?.length, `${id}.conceptMap`).toBeGreaterThan(0);
      expect(quest.filesToCreate?.length, `${id}.filesToCreate`).toBeGreaterThan(0);
      expect(quest.steps?.length, `${id}.steps`).toBeGreaterThan(0);
      expect(quest.debuggingNotes?.length, `${id}.debuggingNotes`).toBeGreaterThan(0);
      expect(quest.publicShowcaseSeed, `${id}.publicShowcaseSeed`).toBeTruthy();
    }
  });

  it("基础弧线的主线台词齐备（米拉逐关引导）", () => {
    for (const id of FOUNDATION) {
      const line = NPC_DIALOGUES.find((d) => d.context === "quest_focus" && d.questId === id);
      expect(line, `缺少 ${id} 的 quest_focus 台词`).toBeDefined();
    }
  });

  it("Boss 之门要求五问 + 总结，且铸成桥村之印", () => {
    const boss = QUEST_BY_ID.boss_bridge;
    const required = boss.evidenceRequired.filter((e) => !e.optional);
    expect(required.length).toBe(6); // 总结 + 五问
    expect(boss.artifactIds).toContain("art_boss_bridge");
    expect(boss.prerequisites).toEqual(["m0", "m1", "m2", "m3"]);
  });

  it("R0 产出炉火誓约并让证据驱动技能就绪", () => {
    const r0 = QUEST_BY_ID.q_r0;
    expect(r0.artifactIds).toContain("art_r0");
    expect(r0.skills).toContain("skill_evidence_progression");
    expect(r0.skills).toContain("skill_career_north_star");
    expect(r0.rewards.skillPoints).toBeGreaterThanOrEqual(2);
  });
});

describe("内容完整性 · 营地支线（Act 0）", () => {
  const BASECAMP = ["b1", "b2", "b3", "b4", "b5", "b6"];

  it("营地任务全部可选且不阻塞任何主线任务", () => {
    for (const id of BASECAMP) {
      const quest = QUEST_BY_ID[id];
      expect(quest.optional, `${id} 应为可选`).toBe(true);
      expect(quest.regionId).toBe("production_basecamp");
    }
    // 没有任何主线任务把营地任务列为前置
    for (const quest of QUESTS.filter((q) => !q.optional)) {
      for (const pid of quest.prerequisites) {
        expect(BASECAMP.includes(pid), `${quest.id} 不应依赖营地任务 ${pid}`).toBe(false);
      }
    }
  });

  it("营地区域是支线区域（side），点燃炉火后解锁", () => {
    const region = REGION_BY_ID.production_basecamp;
    expect(region.side).toBe(true);
    for (const id of BASECAMP) {
      expect(QUEST_BY_ID[id].prerequisites).toEqual(["q_r0"]);
    }
  });
});
