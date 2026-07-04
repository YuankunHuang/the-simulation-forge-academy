import type { Artifact, EvidenceRequirement, Quest } from "@/types/domain";

/**
 * evidenceEngine — 证据校验与展示建议。
 * 核心规则：无证据，无精通 XP。必填字段全部有效才能完成任务。
 */

export interface EvidenceValidation {
  ok: boolean;
  /** 缺失或无效的必填字段 label */
  missing: string[];
}

function isFieldValid(req: EvidenceRequirement, raw: string | undefined): boolean {
  const value = (raw ?? "").trim();
  if (!value) return false;
  if (req.type === "commit_hash") {
    // 宽松校验：至少 6 个非空白字符（允许缩写 hash 或 "local: xxx" 说明）
    return value.length >= 6;
  }
  return true;
}

export function validateEvidence(quest: Quest, fields: Record<string, string>): EvidenceValidation {
  const missing: string[] = [];
  for (const req of quest.evidenceRequired) {
    if (req.optional) continue;
    if (!isFieldValid(req, fields[req.id])) {
      missing.push(req.label);
    }
  }
  return { ok: missing.length === 0, missing };
}

/** 单字段即时校验（表单 UI 用）。 */
export function isEvidenceFieldValid(req: EvidenceRequirement, raw: string | undefined): boolean {
  if (req.optional) return true;
  return isFieldValid(req, raw);
}

/**
 * Boss 答辩：单题演练 Prompt。
 * 让 AI 扮演面试官只围绕这一题追问——先听玩家说，再暴露模糊之处。
 */
export function defenseDrillPrompt(quest: Quest, req: EvidenceRequirement): string {
  return `你是一位友善但严格的系统工程面试官。现在只围绕一个问题对我进行答辩演练。

背景：这是我的项目 Unity Native Boundary Lab 的 Boss 答辩（${quest.code} — ${quest.title}）中的一题。

本题：${req.label}

演练流程：
1. 先让我完整陈述我的回答，不要打断，也不要先替我回答。
2. 针对我的回答提出 2-3 个追问，暴露模糊或含混之处。
3. 指出我遗漏的关键机制或误用的术语。
4. 最后给出一个 60-90 秒口头版本的改进示范。

保持严格但不刻薄。开始吧，请先说：「请陈述你的回答。」`;
}

/**
 * 把 Boss 答辩的全部作答拼装成一份可存档/可复制的面试防线文本。
 * store 写篝火日志与工坊「复制完整答辩」共用此函数。
 */
export function assembleDefenseText(quest: Quest, fields: Record<string, string>): string {
  return quest.evidenceRequired
    .map((req) => {
      const value = (fields[req.id] ?? "").trim();
      return value ? `【${req.label}】\n${value}` : "";
    })
    .filter(Boolean)
    .join("\n\n");
}

export interface ShowcasePrompts {
  linkedin: string;
  blog: string;
  portfolio: string;
  resume: string;
  interview: string;
}

/** 为神器生成可复制的展示 prompt / 文案。 */
export function showcasePromptsFor(artifact: Artifact): ShowcasePrompts {
  return {
    linkedin: `请帮我起草一篇技术向 LinkedIn 帖子。主题：${artifact.nameEn}（${artifact.name}）。它证明了：${artifact.proves}。建议角度：${artifact.linkedinSuggestion}。语气要求：谦逊、工程导向、不夸大，中英混排（技术名词用英文）。长度 150-250 字。`,
    blog: `请帮我列一篇博客的大纲。主题基于我的成果：${artifact.nameEn}（${artifact.name}）。写作建议：${artifact.blogSuggestion}。结构：背景 → 问题 → 方法 → 数据/证据 → 结论与局限。面向 Unity/C++ 开发者。`,
    portfolio: artifact.portfolioSuggestion,
    resume: artifact.resumeBullet,
    interview: artifact.interviewExplanation,
  };
}
