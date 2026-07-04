import { ARTIFACT_BY_ID } from "@/content/artifacts";
import { QUEST_BY_ID } from "@/content/quests";
import { getRecommendedQuest } from "@/engine/questEngine";
import { EMPTY_BUNDLE, mergeBundles, skillsMadeAvailableBy } from "@/engine/rewardEngine";
import { uid } from "@/lib/ids";
import type { RewardBundle, SessionRecap, SprintSession } from "@/types/domain";

/**
 * sprintEngine — 深度冲刺会话与 Session Recap。
 * 冲刺不改变解锁规则：Boss 之门依然只认证据。
 */

export function createSprint(nowIso: string): SprintSession {
  return { startedAt: nowIso, questIds: [], artifactIds: [], totals: { ...EMPTY_BUNDLE } };
}

export function addQuestToSprint(
  session: SprintSession,
  questId: string,
  artifactIds: string[],
  bundle: RewardBundle,
): SprintSession {
  return {
    ...session,
    questIds: [...session.questIds, questId],
    artifactIds: [...session.artifactIds, ...artifactIds],
    totals: mergeBundles(session.totals, bundle),
  };
}

/** 生成冲刺回顾：完成清单、证据产出、展示建议、下一个风险与推荐任务。 */
export function buildRecap(
  session: SprintSession,
  nowIso: string,
  completedIdsAfter: readonly string[],
): SessionRecap {
  const showcaseSuggestions = session.artifactIds
    .map((id) => ARTIFACT_BY_ID[id])
    .filter(Boolean)
    .map((a) => `${a.name}：${a.linkedinSuggestion}`);

  const lastQuestId = session.questIds[session.questIds.length - 1];
  const lastQuest = lastQuestId ? QUEST_BY_ID[lastQuestId] : undefined;
  const nextQuest = getRecommendedQuest(completedIdsAfter);

  const skillIdsAvailable = session.questIds.flatMap((qid) =>
    // 冲刺开始前的完成集合无法精确还原，这里以“除本次冲刺外”的集合近似
    skillsMadeAvailableBy(
      qid,
      completedIdsAfter.filter((id) => !session.questIds.includes(id)),
    ).map((s) => s.id),
  );

  return {
    id: uid("recap"),
    startedAt: session.startedAt,
    endedAt: nowIso,
    questIds: session.questIds,
    artifactIds: session.artifactIds,
    skillIdsAvailable: [...new Set(skillIdsAvailable)],
    totals: session.totals,
    showcaseSuggestions,
    nextRisk: lastQuest?.nextRisk,
    nextQuestId: nextQuest?.id,
  };
}
