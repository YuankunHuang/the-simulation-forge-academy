import { ARTIFACTS } from "@/content/artifacts";
import { SKILL_NODES } from "@/content/skills";
import type { Artifact, Quest, RewardBundle, SkillNode, Wallet } from "@/types/domain";

/**
 * rewardEngine — 奖励结算、神器解锁、称号与等级。
 * 核心规则：基础奖励来自任务定义；高质量反思与展示型证据获得额外洞察/声望。
 */

export const EMPTY_BUNDLE: RewardBundle = { xp: 0, gold: 0, skillPoints: 0, reputation: 0, insight: 0 };

/** 等级曲线：升到 n 级累计需要 100 * n * (n-1) / 2 XP（L2=100, L3=300, L4=600…）。 */
export function levelForXp(xp: number): number {
  let level = 1;
  while (xp >= xpThresholdForLevel(level + 1)) level++;
  return level;
}

export function xpThresholdForLevel(level: number): number {
  return (100 * level * (level - 1)) / 2;
}

export interface XpProgress {
  level: number;
  intoLevel: number;
  needed: number;
  pct: number;
}

export function xpProgress(xp: number): XpProgress {
  const level = levelForXp(xp);
  const cur = xpThresholdForLevel(level);
  const next = xpThresholdForLevel(level + 1);
  const intoLevel = xp - cur;
  const needed = next - cur;
  return { level, intoLevel, needed, pct: Math.min(100, Math.round((intoLevel / needed) * 100)) };
}

/** 展示型证据类型：填写质量高时奖励额外声望。 */
const SHOWCASE_TYPES = new Set(["linkedin_draft", "blog_draft", "portfolio_note", "doc_section"]);

export interface ComputedRewards {
  bundle: RewardBundle;
  insightBonus: number;
  reputationBonus: number;
}

/** 结算任务奖励：基础 + 反思质量洞察加成 + 展示证据声望加成。 */
export function computeCompletionRewards(quest: Quest, fields: Record<string, string>): ComputedRewards {
  let insightBonus = 0;
  let reputationBonus = 0;

  for (const req of quest.evidenceRequired) {
    const value = (fields[req.id] ?? "").trim();
    if (!value) continue;
    if (req.type === "text_reflection") {
      if (value.length >= 200) insightBonus = Math.max(insightBonus, 2);
      else if (value.length >= 60) insightBonus = Math.max(insightBonus, 1);
    }
    if (SHOWCASE_TYPES.has(req.type) && value.length >= 80) {
      reputationBonus += 5;
    }
  }

  const bundle: RewardBundle = {
    xp: quest.rewards.xp,
    gold: quest.rewards.gold,
    skillPoints: quest.rewards.skillPoints,
    reputation: quest.rewards.reputation + reputationBonus,
    insight: quest.rewards.insight + insightBonus,
  };
  return { bundle, insightBonus, reputationBonus };
}

export function applyRewards(wallet: Wallet, bundle: RewardBundle): Wallet {
  return {
    xp: wallet.xp + bundle.xp,
    gold: wallet.gold + bundle.gold,
    skillPoints: wallet.skillPoints + bundle.skillPoints,
    reputation: wallet.reputation + bundle.reputation,
    insight: wallet.insight + bundle.insight,
  };
}

export function mergeBundles(a: RewardBundle, b: RewardBundle): RewardBundle {
  return {
    xp: a.xp + b.xp,
    gold: a.gold + b.gold,
    skillPoints: a.skillPoints + b.skillPoints,
    reputation: a.reputation + b.reputation,
    insight: a.insight + b.insight,
  };
}

export function artifactsForQuest(questId: string): Artifact[] {
  return ARTIFACTS.filter((a) => a.sourceQuestId === questId);
}

/** 该任务完成后，哪些技能节点获得了“证据就绪”状态。 */
export function skillsMadeAvailableBy(questId: string, completedIdsBefore: readonly string[]): SkillNode[] {
  return SKILL_NODES.filter(
    (n) =>
      n.sourceQuestIds.includes(questId) &&
      !n.sourceQuestIds.some((src) => completedIdsBefore.includes(src)),
  );
}

/** 职业称号阶梯：按里程碑推进（顺序敏感，后者覆盖前者）。 */
const TITLE_LADDER: Array<{ questId: string; title: string; titleEn: string }> = [
  { questId: "m0", title: "边界见习生", titleEn: "Boundary Initiate" },
  { questId: "m2", title: "原生信号学徒", titleEn: "Native Signal Apprentice" },
  { questId: "boss_bridge", title: "互操作桥匠", titleEn: "Interop Bridgewright" },
  { questId: "boss_benchmark", title: "边界基准工程师", titleEn: "Boundary Benchmark Builder" },
];

export const STARTING_TITLE = { title: "Unity 生产工程师", titleEn: "Unity Production Engineer" };

export function titleForCompleted(completedIds: readonly string[]): { title: string; titleEn: string } {
  let current = STARTING_TITLE;
  for (const rung of TITLE_LADDER) {
    if (completedIds.includes(rung.questId)) {
      current = { title: rung.title, titleEn: rung.titleEn };
    }
  }
  return current;
}

/** 小额奖励常量：复习/热身/低能量签到。 */
export const REVIEW_GOLD = 5;
export const WARMUP_GOLD = 2;
export const LOW_ENERGY_GOLD = 15;
