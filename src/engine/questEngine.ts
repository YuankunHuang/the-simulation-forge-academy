import { QUEST_BY_ID } from "@/content/quests";
import { validateEvidence } from "@/engine/evidenceEngine";
import { getAvailableQuests, getQuestStatus } from "@/engine/unlockEngine";
import type { Quest } from "@/types/domain";

/**
 * questEngine — 今日推荐、完成资格与“继续冒险”。
 * 每日任务是推荐而非硬锁：玩家可以在一天内推进多关，但每关都要证据。
 */

/** 今日推荐：世界顺序上第一个可接的非可选任务；主线清空后才推荐可选任务。 */
export function getRecommendedQuest(completedIds: readonly string[]): Quest | null {
  const available = getAvailableQuests(completedIds);
  const mainline = available.filter((q) => !q.optional);
  return mainline[0] ?? available[0] ?? null;
}

/** 冲刺“继续冒险”：完成 justCompletedId 之后的下一个可接任务。 */
export function getNextQuest(completedIds: readonly string[], justCompletedId?: string): Quest | null {
  const available = getAvailableQuests(completedIds).filter((q) => q.id !== justCompletedId);
  const mainline = available.filter((q) => !q.optional);
  return mainline[0] ?? available[0] ?? null;
}

export interface CompletionEligibility {
  ok: boolean;
  reasons: string[];
}

/** 任务能否完成：状态可接 + 必填证据齐全。 */
export function canCompleteQuest(
  quest: Quest,
  completedIds: readonly string[],
  fields: Record<string, string>,
): CompletionEligibility {
  const reasons: string[] = [];
  const statusInfo = getQuestStatus(quest, completedIds);
  if (statusInfo.status === "completed") {
    reasons.push("任务已经完成过了。");
  }
  if (statusInfo.status === "locked") {
    if (statusInfo.regionLocked) reasons.push("所在区域尚未解锁。");
    for (const pid of statusInfo.missingPrereqIds) {
      const pq = QUEST_BY_ID[pid];
      reasons.push(`前置未完成：${pq ? `${pq.code} — ${pq.title}` : pid}`);
    }
  }
  const evidence = validateEvidence(quest, fields);
  if (!evidence.ok) {
    for (const miss of evidence.missing) reasons.push(`缺少证据：${miss}`);
  }
  return { ok: reasons.length === 0, reasons };
}

/** 无可接任务时的友好解释（下一步被什么挡住了）。 */
export function getBlockedExplanation(completedIds: readonly string[]): string {
  const next = getRecommendedQuest(completedIds);
  if (next) return "";
  return "当前解锁范围内的任务都已完成。第一幕之后的篇章还在迷雾中铸造——去宝库看看你的战利品，或休整片刻。";
}
