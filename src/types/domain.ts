/**
 * 领域模型 — 全应用共享的强类型定义。
 * content/ 提供数据，engine/ 提供纯逻辑，store/ 持有 PlayerState。
 */

export type EnergyMode = "low" | "normal" | "deep";

export type QuestType = "main" | "training" | "drill" | "reflection" | "boss" | "bonus";

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export type EvidenceType =
  | "commit_hash"
  | "screenshot_note"
  | "text_reflection"
  | "benchmark_file"
  | "doc_section"
  | "code_snippet"
  | "blog_draft"
  | "linkedin_draft"
  | "portfolio_note";

export interface EvidenceRequirement {
  id: string;
  type: EvidenceType;
  label: string;
  placeholder?: string;
  /** 可选字段不阻塞任务完成 */
  optional?: boolean;
  multiline?: boolean;
}

export interface RewardBundle {
  xp: number;
  gold: number;
  skillPoints: number;
  reputation: number;
  insight: number;
}

export interface ResourceRef {
  label: string;
  url?: string;
  note?: string;
}

export interface Quest {
  id: string;
  /** 显示编号，如 M0 / BOSS */
  code: string;
  title: string;
  regionId: string;
  type: QuestType;
  /** 全世界线性顺序，用于推荐与“继续冒险” */
  order: number;
  /** 可选支线（如 M13），不阻塞主线推荐 */
  optional?: boolean;
  narrativeHook: string;
  objective: string;
  whyItMatters: string;
  prerequisites: string[];
  definitionOfDone: string[];
  evidenceRequired: EvidenceRequirement[];
  /** 完成后获得“证据来源”的技能节点 id */
  skills: string[];
  artifactIds: string[];
  rewards: RewardBundle;
  aiPrompt: string;
  resources: ResourceRef[];
  commonTraps: string[];
  interviewExplanation: string;
  nextRisk: string;
  /** 完成后开放的任务 id（信息展示用） */
  unlocks: string[];
  /** “当前禁止事项”护栏面板 */
  forbiddenForNow?: string[];
  estimate?: string;
}

export interface Region {
  id: string;
  actId: string;
  /** Act 内顺序 */
  order: number;
  name: string;
  nameEn: string;
  /** 一句氛围描述（预览态只显示这个） */
  vibe: string;
  description: string;
  bossQuestId?: string;
  icon: string;
}

export interface Campaign {
  id: string;
  order: number;
  name: string;
  nameEn: string;
  tagline: string;
  regionIds: string[];
}

export type RegionVisibility = "unlocked" | "preview" | "fogged";

export interface MapNode {
  id: string;
  regionId: string;
  questId?: string;
  x: number;
  y: number;
}

export interface Artifact {
  id: string;
  name: string;
  nameEn: string;
  rarity: Rarity;
  sourceQuestId: string;
  /** 它证明了什么 */
  proves: string;
  careerValue: string;
  skillsProven: string[];
  linkedinSuggestion: string;
  blogSuggestion: string;
  portfolioSuggestion: string;
  resumeBullet: string;
  interviewExplanation: string;
  icon: string;
}

export interface SkillTree {
  id: string;
  name: string;
  nameEn: string;
  order: number;
  /** Tailwind 语义色 key：ember/moss/skyblue/plum/wood/stone */
  accent: string;
}

export interface SkillNode {
  id: string;
  treeId: string;
  name: string;
  description: string;
  /** 任一来源任务完成即产生证据；为空 = 未来篇章内容 */
  sourceQuestIds: string[];
  cost: number;
  tier: number;
}

export interface ReviewCard {
  id: string;
  prompt: string;
  answer: string;
  questId: string;
  skillId?: string;
  difficulty: 1 | 2 | 3;
}

export type ReviewRating = "forgot" | "hard" | "good" | "easy";

export interface ReviewCardState {
  cardId: string;
  /** YYYY-MM-DD */
  nextReviewDate: string;
  intervalDays: number;
  ease: number;
  reps: number;
  lapses: number;
}

export interface BonusDungeon {
  id: string;
  name: string;
  nameEn: string;
  purpose: string;
  portfolioValue: string;
  costGold: number;
  prerequisiteQuestIds: string[];
  /** 购买后展示的范围简报（防止变成新的大项目） */
  scope: string[];
  deliverable: string;
  completionRewards: RewardBundle;
  icon: string;
}

export type DialogueContext =
  | "greeting_morning"
  | "greeting_afternoon"
  | "greeting_evening"
  | "welcome_back"
  | "low_energy"
  | "deep_start"
  | "boss_ahead"
  | "quest_complete"
  | "region_flavor"
  | "all_clear";

export interface NPCDialogue {
  id: string;
  context: DialogueContext;
  text: string;
  regionId?: string;
}

export interface QuestCompletion {
  questId: string;
  /** ISO 时间戳 */
  completedAt: string;
  evidence: Record<string, string>;
}

export interface EvidenceSubmission {
  questId: string;
  submittedAt: string;
  fields: Record<string, string>;
}

export interface JournalEntry {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  kind: "reflection" | "low_energy" | "note" | "dungeon";
  questId?: string;
  text: string;
}

export interface SessionRecap {
  id: string;
  startedAt: string;
  endedAt: string;
  questIds: string[];
  artifactIds: string[];
  skillIdsAvailable: string[];
  totals: RewardBundle;
  showcaseSuggestions: string[];
  nextRisk?: string;
  nextQuestId?: string;
}

export interface SprintSession {
  startedAt: string;
  questIds: string[];
  artifactIds: string[];
  totals: RewardBundle;
}

export interface CeremonyPayload {
  questId: string;
  rewards: RewardBundle;
  artifactIds: string[];
  /** 本次完成让哪些技能节点“证据就绪” */
  skillsMadeAvailable: string[];
  newTitle?: string;
  leveledUpTo?: number;
}

export interface Wallet {
  xp: number;
  gold: number;
  skillPoints: number;
  reputation: number;
  insight: number;
}

export interface PlayerState {
  version: number;
  createdAt: string;
  /** YYYY-MM-DD，最近一次有效行动日 */
  lastActiveDate: string;
  /** 最近活跃日集合（保留 60 天），用于动量之火 */
  activeDates: string[];
  energyMode: EnergyMode;
  wallet: Wallet;
  questCompletions: Record<string, QuestCompletion>;
  unlockedSkillIds: string[];
  purchasedDungeonIds: string[];
  completedDungeonIds: string[];
  reviewStates: Record<string, ReviewCardState>;
  journal: JournalEntry[];
  recaps: SessionRecap[];
  sprint: SprintSession | null;
  /** cardId -> date，热身奖励每卡每天一次 */
  warmupClaims: Record<string, string>;
  lowEnergyDoneDate: string | null;
  playerName: string;
}
