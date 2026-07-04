import { ORDERED_REGIONS, REGION_BY_ID } from "@/content/campaigns";
import { ORDERED_QUESTS, QUEST_BY_ID } from "@/content/quests";
import type { Quest, Region, RegionVisibility } from "@/types/domain";

/**
 * unlockEngine — 可用性与战争迷雾。
 * 纯函数：输入已完成任务 id 集合，输出区域可见性 / 任务状态。
 * 规则：主线区域按线性门控解锁，不可跳过；当前解锁区域之后的第一个区域为“剪影预览”，
 * 更远的全部藏于迷雾。支线区域（side，如生产经验营地）独立解锁，不参与线性迷雾链。
 */

/** 区域解锁门：完成该任务后区域解锁。null = 初始解锁；undefined（不在表中）= 本 MVP 不可解锁（Act II/III）。 */
const REGION_GATES: Record<string, string | null> = {
  hearth_hall: null,
  bridge_village: "q_r0",
  production_basecamp: "q_r0",
  benchmark_plains: "boss_bridge",
  layout_archives: "boss_benchmark",
  safety_clinic: "boss_layout",
  package_harbor: "boss_safety",
  mobile_gate: "boss_package",
  observatory_annex: "boss_mobile",
};

export function isQuestCompleted(completedIds: readonly string[], questId: string): boolean {
  return completedIds.includes(questId);
}

export function isRegionUnlocked(regionId: string, completedIds: readonly string[]): boolean {
  const gate = REGION_GATES[regionId];
  if (gate === undefined) return false;
  if (gate === null) return true;
  return completedIds.includes(gate);
}

/** 全部区域的可见性（unlocked / preview / fogged），跨幕线性推导；支线区域独立判定，不占用预览位。 */
export function getRegionVisibility(completedIds: readonly string[]): Record<string, RegionVisibility> {
  const result: Record<string, RegionVisibility> = {};
  let previewAssigned = false;
  for (const region of ORDERED_REGIONS) {
    if (region.side) {
      // 支线区域：解锁即全开，未解锁保持剪影预览（永不深雾，玩家始终知道营地在那里）
      result[region.id] = isRegionUnlocked(region.id, completedIds) ? "unlocked" : "preview";
      continue;
    }
    if (isRegionUnlocked(region.id, completedIds)) {
      result[region.id] = "unlocked";
    } else if (!previewAssigned) {
      result[region.id] = "preview";
      previewAssigned = true;
    } else {
      result[region.id] = "fogged";
    }
  }
  return result;
}

export type QuestStatus = "completed" | "available" | "locked";

export interface QuestStatusInfo {
  status: QuestStatus;
  /** 锁定时缺少的前置任务 */
  missingPrereqIds: string[];
  /** 锁定是否因区域未解锁 */
  regionLocked: boolean;
}

export function getQuestStatus(quest: Quest, completedIds: readonly string[]): QuestStatusInfo {
  if (completedIds.includes(quest.id)) {
    return { status: "completed", missingPrereqIds: [], regionLocked: false };
  }
  const missingPrereqIds = quest.prerequisites.filter((p) => !completedIds.includes(p));
  const regionLocked = !isRegionUnlocked(quest.regionId, completedIds);
  if (missingPrereqIds.length > 0 || regionLocked) {
    return { status: "locked", missingPrereqIds, regionLocked };
  }
  return { status: "available", missingPrereqIds: [], regionLocked: false };
}

/** 当前全部可接任务，按世界顺序。 */
export function getAvailableQuests(completedIds: readonly string[]): Quest[] {
  return ORDERED_QUESTS.filter((q) => getQuestStatus(q, completedIds).status === "available");
}

export interface BossGateRequirement {
  label: string;
  met: boolean;
}

/** Boss 之门的进度清单（前置任务 + 证据要求描述）。 */
export function getBossGateChecklist(bossQuest: Quest, completedIds: readonly string[]): BossGateRequirement[] {
  const prereqItems: BossGateRequirement[] = bossQuest.prerequisites.map((pid) => {
    const q = QUEST_BY_ID[pid];
    return {
      label: q ? `完成 ${q.code} — ${q.title}（含证据）` : `完成 ${pid}`,
      met: completedIds.includes(pid),
    };
  });
  const evidenceItems: BossGateRequirement[] = bossQuest.evidenceRequired
    .filter((e) => !e.optional)
    .map((e) => ({ label: e.label, met: completedIds.includes(bossQuest.id) }));
  return [...prereqItems, ...evidenceItems];
}

/** 某区域内的全部任务（世界顺序）。 */
export function getRegionQuests(regionId: string): Quest[] {
  return ORDERED_QUESTS.filter((q) => q.regionId === regionId);
}

/** 区域完成度：x / y。 */
export function getRegionProgress(regionId: string, completedIds: readonly string[]): { done: number; total: number } {
  const quests = getRegionQuests(regionId);
  return {
    done: quests.filter((q) => completedIds.includes(q.id)).length,
    total: quests.length,
  };
}

/** 当前“主舞台”区域：包含首个可接任务的区域；全通关则取最后一个解锁区域。 */
export function getCurrentRegion(completedIds: readonly string[]): Region {
  const available = getAvailableQuests(completedIds);
  if (available.length > 0) {
    return REGION_BY_ID[available[0].regionId];
  }
  const visibility = getRegionVisibility(completedIds);
  const unlocked = ORDERED_REGIONS.filter((r) => visibility[r.id] === "unlocked");
  return unlocked[unlocked.length - 1] ?? ORDERED_REGIONS[0];
}
