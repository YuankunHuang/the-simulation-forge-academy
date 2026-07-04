import { ORDERED_QUESTS } from "@/content/quests";
import { REVIEW_CARDS } from "@/content/reviewCards";
import { addDays } from "@/lib/date";
import type { Quest, ReviewCard, ReviewCardState, ReviewRating } from "@/types/domain";

/**
 * reviewEngine — 简化版间隔重复（SM-2 精神，非完整 Anki）。
 * 卡片在关联任务完成后进入卡组；热身回顾用于任务开始前的检索练习。
 */

export const DEFAULT_EASE = 2.5;
export const MIN_EASE = 1.3;
export const MAX_EASE = 3.0;
export const MAX_INTERVAL_DAYS = 120;

export function initialCardState(cardId: string, today: string): ReviewCardState {
  return {
    cardId,
    nextReviewDate: today,
    intervalDays: 0,
    ease: DEFAULT_EASE,
    reps: 0,
    lapses: 0,
  };
}

/** 根据评分更新间隔：忘了 → 当天重来；困难/记得/轻松 → 递增间隔。 */
export function rateCard(prev: ReviewCardState, rating: ReviewRating, today: string): ReviewCardState {
  let { intervalDays, ease, reps, lapses } = prev;

  switch (rating) {
    case "forgot":
      lapses += 1;
      reps = 0;
      intervalDays = 0;
      ease = Math.max(MIN_EASE, ease - 0.2);
      break;
    case "hard":
      reps += 1;
      intervalDays = intervalDays <= 0 ? 1 : Math.max(1, Math.round(intervalDays * 1.2));
      ease = Math.max(MIN_EASE, ease - 0.05);
      break;
    case "good":
      reps += 1;
      intervalDays = intervalDays <= 0 ? 1 : Math.round(intervalDays * ease);
      break;
    case "easy":
      reps += 1;
      intervalDays = intervalDays <= 0 ? 2 : Math.max(2, Math.round(intervalDays * ease * 1.3));
      ease = Math.min(MAX_EASE, ease + 0.08);
      break;
  }

  intervalDays = Math.min(intervalDays, MAX_INTERVAL_DAYS);
  return {
    ...prev,
    intervalDays,
    ease,
    reps,
    lapses,
    nextReviewDate: addDays(today, intervalDays),
  };
}

/** 卡片是否已入组（关联任务完成 = 学过）。 */
export function isCardInDeck(card: ReviewCard, completedIds: readonly string[]): boolean {
  return completedIds.includes(card.questId);
}

/** 今日到期卡：新卡（无状态）或 nextReviewDate <= today。 */
export function getDueCards(
  states: Record<string, ReviewCardState>,
  completedIds: readonly string[],
  today: string,
): ReviewCard[] {
  return REVIEW_CARDS.filter((card) => {
    if (!isCardInDeck(card, completedIds)) return false;
    const state = states[card.id];
    if (!state) return true;
    return state.nextReviewDate <= today;
  });
}

/** 未来到期（已入组但今天不到期）的数量，用于空状态提示。 */
export function getUpcomingCount(
  states: Record<string, ReviewCardState>,
  completedIds: readonly string[],
  today: string,
): number {
  return REVIEW_CARDS.filter((card) => {
    if (!isCardInDeck(card, completedIds)) return false;
    const state = states[card.id];
    return !!state && state.nextReviewDate > today;
  }).length;
}

/** 完成该任务会让哪些复习卡进入卡组（奖励仪式展示用）。 */
export function cardsUnlockedBy(questId: string): ReviewCard[] {
  return REVIEW_CARDS.filter((c) => c.questId === questId);
}

export interface UpcomingCardInfo {
  quest: Quest;
  cards: ReviewCard[];
}

/**
 * 空卡组引导：按世界顺序找到第一个「未完成且带复习卡」的任务，
 * 告诉玩家完成它之后会有哪些知识卡入组。
 */
export function getUpcomingCardInfo(completedIds: readonly string[]): UpcomingCardInfo | null {
  for (const quest of ORDERED_QUESTS) {
    if (completedIds.includes(quest.id)) continue;
    const cards = cardsUnlockedBy(quest.id);
    if (cards.length > 0) return { quest, cards };
  }
  return null;
}

/**
 * 热身回顾卡（任务开始前的检索练习）：
 * 1) 优先：与该任务技能相关且已到期的老卡；
 * 2) 其次：任意到期老卡；
 * 3) 最后：该任务自己的卡作为“预习提问”（学前检索）。
 */
export function getWarmupCard(
  quest: Quest,
  states: Record<string, ReviewCardState>,
  completedIds: readonly string[],
  today: string,
): { card: ReviewCard; kind: "review" | "preview" } | null {
  const due = getDueCards(states, completedIds, today);
  const related = due.find((c) => (c.skillId ? quest.skills.includes(c.skillId) : false));
  if (related) return { card: related, kind: "review" };
  if (due.length > 0) return { card: due[0], kind: "review" };
  const own = REVIEW_CARDS.find((c) => c.questId === quest.id);
  if (own && !completedIds.includes(quest.id)) return { card: own, kind: "preview" };
  return null;
}
