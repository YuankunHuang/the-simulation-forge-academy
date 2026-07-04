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
