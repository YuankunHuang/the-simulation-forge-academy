import type { EnergyMode, EvidenceType, QuestType, Rarity } from "@/types/domain";

export function formatNumber(n: number): string {
  return n.toLocaleString("zh-CN");
}

export const RARITY_LABEL: Record<Rarity, string> = {
  common: "普通",
  uncommon: "优良",
  rare: "稀有",
  epic: "史诗",
  legendary: "传说",
};

/** 稀有度 → Tailwind 类（文字/边框/背景微染） */
export const RARITY_STYLE: Record<Rarity, { text: string; border: string; bg: string; glow: string }> = {
  common: {
    text: "text-stone2",
    border: "border-stone2/40",
    bg: "bg-stone2/10",
    glow: "",
  },
  uncommon: {
    text: "text-moss-deep",
    border: "border-moss/50",
    bg: "bg-moss/10",
    glow: "",
  },
  rare: {
    text: "text-skyblue-deep",
    border: "border-skyblue/60",
    bg: "bg-skyblue/10",
    glow: "shadow-[0_0_14px_rgba(127,167,201,0.35)]",
  },
  epic: {
    text: "text-plum-deep",
    border: "border-plum/60",
    bg: "bg-plum/10",
    glow: "shadow-[0_0_16px_rgba(155,126,189,0.40)]",
  },
  legendary: {
    text: "text-ember-deep",
    border: "border-ember/70",
    bg: "bg-ember/10",
    glow: "shadow-[0_0_20px_rgba(232,163,61,0.50)]",
  },
};

export const EVIDENCE_TYPE_LABEL: Record<EvidenceType, string> = {
  commit_hash: "Commit Hash",
  screenshot_note: "截图说明 / 路径",
  text_reflection: "文字反思",
  benchmark_file: "Benchmark 导出",
  doc_section: "文档段落",
  code_snippet: "代码片段",
  blog_draft: "博客草稿",
  linkedin_draft: "LinkedIn 草稿",
  portfolio_note: "作品集笔记",
};

export const QUEST_TYPE_LABEL: Record<QuestType, string> = {
  main: "主线",
  training: "训练",
  drill: "演练",
  reflection: "反思",
  boss: "Boss 之门",
  bonus: "奖励秘境",
};

export const MODE_LABEL: Record<EnergyMode, { name: string; desc: string }> = {
  low: { name: "低能量", desc: "1 张复习卡 + 一句小反思，也算胜利" },
  normal: { name: "日常", desc: "1 步主线 + 1 份证据 + 1 次反思" },
  deep: { name: "深度冲刺", desc: "连续推进多个任务，结束生成冲刺回顾" },
};

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
