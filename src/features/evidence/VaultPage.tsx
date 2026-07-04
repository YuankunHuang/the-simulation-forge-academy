import { useState } from "react";
import { motion } from "framer-motion";
import { ARTIFACTS } from "@/content/artifacts";
import { QUEST_BY_ID } from "@/content/quests";
import { Icon } from "@/components/icons";
import { CopyButton } from "@/components/ui/CopyButton";
import { Modal } from "@/components/ui/Modal";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { showcasePromptsFor } from "@/engine/evidenceEngine";
import { RARITY_STYLE } from "@/lib/formatting";
import { selectCompletedIds, usePlayerStore } from "@/store/playerStore";
import type { Artifact } from "@/types/domain";
import { VaultTabs } from "./VaultTabs";

/** 证据宝库 — 战利品陈列室。锁定的神器保留悬念，解锁的神器给出全套职业展示内容。 */
export function VaultPage() {
  const completedIds = usePlayerStore(selectCompletedIds);
  const [selected, setSelected] = useState<Artifact | null>(null);

  const unlockedCount = ARTIFACTS.filter((a) => completedIds.includes(a.sourceQuestId)).length;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold text-ink flex items-center gap-2">
          <Icon name="chest" size={22} className="text-wood" />
          证据宝库
        </h1>
        <p className="text-sm text-ink-soft mt-1">
          已铸造 {unlockedCount} / {ARTIFACTS.length} 件证据神器。每一件都是你转型路上可以指给别人看的东西。
        </p>
      </header>

      <VaultTabs />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ARTIFACTS.map((artifact, i) => {
          const unlocked = completedIds.includes(artifact.sourceQuestId);
          const quest = QUEST_BY_ID[artifact.sourceQuestId];
          const style = RARITY_STYLE[artifact.rarity];

          // 锁定态：剪影 + 稀有度 + 来源 + 悬念一句，不泄露展示内容
          if (!unlocked) {
            return (
              <div
                key={artifact.id}
                className={`rounded-2xl border border-dashed p-4 bg-cream-200/40 ${style.border} opacity-90`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink/[0.06] text-ink-faint">
                    <Icon name="lock" size={16} />
                  </span>
                  <RarityBadge rarity={artifact.rarity} />
                </div>
                <p className="text-sm font-bold text-ink-faint leading-snug select-none" aria-label="未解锁神器">
                  {artifact.name}
                </p>
                <p className="mt-1.5 text-xs italic text-ink-faint text-balance">「{artifact.teaser}」</p>
                <p className="mt-2.5 text-[11px] font-medium text-wood-dark">
                  铸造条件：完成 {quest ? `${quest.code} · ${quest.title}` : "对应任务"}
                </p>
              </div>
            );
          }

          return (
            <motion.button
              key={artifact.id}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
              whileHover={{ y: -3 }}
              onClick={() => setSelected(artifact)}
              className={`rounded-2xl border-2 bg-cream-50 p-4 text-left transition-shadow ${style.border} ${style.glow} hover:shadow-card`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${style.bg} ${style.text}`}>
                  <Icon name="trophy" size={18} />
                </span>
                <RarityBadge rarity={artifact.rarity} />
              </div>
              <p className="text-sm font-bold text-ink leading-snug">{artifact.name}</p>
              <p className="text-[11px] text-ink-faint mb-1.5">{artifact.nameEn}</p>
              <p className="text-xs text-ink-soft line-clamp-2">{artifact.proves}</p>
              <p className="mt-2 text-[11px] font-medium text-ink-faint">来源：{quest?.code} · 点击查看展示建议</p>
            </motion.button>
          );
        })}
      </div>

      {/* 神器详情 */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name} wide>
        {selected && <ArtifactDetail artifact={selected} />}
      </Modal>
    </div>
  );
}

function ArtifactDetail({ artifact }: { artifact: Artifact }) {
  const completions = usePlayerStore((s) => s.questCompletions);
  const prompts = showcasePromptsFor(artifact);
  const quest = QUEST_BY_ID[artifact.sourceQuestId];
  const completion = completions[artifact.sourceQuestId];

  // 分区顺序：证明 → 职业价值 →（已提交证据）→ LinkedIn → 博客 → 作品集 → 简历 → 面试
  const identitySections: Array<{ title: string; body: string; copyText: string }> = [
    { title: "它证明了什么", body: artifact.proves, copyText: artifact.proves },
    { title: "职业价值", body: artifact.careerValue, copyText: artifact.careerValue },
  ];
  const showcaseSections: Array<{ title: string; body: string; copyText: string }> = [
    { title: "LinkedIn 建议", body: artifact.linkedinSuggestion, copyText: prompts.linkedin },
    { title: "博客建议", body: artifact.blogSuggestion, copyText: prompts.blog },
    { title: "作品集文案", body: artifact.portfolioSuggestion, copyText: artifact.portfolioSuggestion },
    { title: "简历要点（可直接粘贴）", body: prompts.resume, copyText: prompts.resume },
    { title: "面试讲法", body: prompts.interview, copyText: prompts.interview },
  ];

  const renderSection = (sec: { title: string; body: string; copyText: string }) => (
    <div key={sec.title} className="rounded-xl bg-cream-200/50 p-4">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <h3 className="text-xs font-bold text-ink-soft">{sec.title}</h3>
        <CopyButton
          text={sec.copyText}
          label={sec.title.includes("LinkedIn") || sec.title.includes("博客") ? "复制起草 Prompt" : "复制"}
        />
      </div>
      <p className="text-sm text-ink whitespace-pre-wrap">{sec.body}</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <RarityBadge rarity={artifact.rarity} />
        <span className="text-xs text-ink-faint">
          来源任务：{quest ? `${quest.code} · ${quest.title}` : artifact.sourceQuestId}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {artifact.skillsProven.map((s) => (
          <span key={s} className="rounded-full bg-skyblue/10 border border-skyblue/30 px-2.5 py-0.5 text-xs text-skyblue-deep">
            {s}
          </span>
        ))}
      </div>

      {identitySections.map(renderSection)}

      {/* 铸造它的证据 */}
      {completion && quest && (
        <div className="rounded-xl border border-moss/30 bg-moss/5 p-4">
          <h3 className="text-xs font-bold text-moss-deep mb-2.5 flex items-center gap-1.5">
            <Icon name="check" size={13} />
            铸造它的证据（你当时提交的内容）
          </h3>
          <dl className="space-y-2.5">
            {quest.evidenceRequired.map((req) => {
              const value = completion.evidence[req.id];
              if (!value?.trim()) return null;
              return (
                <div key={req.id}>
                  <dt className="text-[11px] font-semibold text-ink-soft mb-0.5">{req.label}</dt>
                  <dd className="whitespace-pre-wrap rounded-lg bg-white/60 px-3 py-1.5 text-xs text-ink">{value}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      )}

      {showcaseSections.map(renderSection)}
      <p className="text-[11px] text-ink-faint">
        提示：LinkedIn / 博客的复制按钮给出的是完整起草 Prompt，交给 AI 生成草稿。学院不会自动发布任何内容。
      </p>
    </div>
  );
}
