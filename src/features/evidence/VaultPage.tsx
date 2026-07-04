import { useState } from "react";
import { motion } from "framer-motion";
import { ARTIFACTS } from "@/content/artifacts";
import { QUEST_BY_ID } from "@/content/quests";
import { Icon } from "@/components/icons";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { Modal } from "@/components/ui/Modal";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { showcasePromptsFor } from "@/engine/evidenceEngine";
import { RARITY_STYLE } from "@/lib/formatting";
import { selectCompletedIds, usePlayerStore } from "@/store/playerStore";
import type { Artifact } from "@/types/domain";

/** 证据宝库 — 战利品陈列室。每件神器附带职业展示建议。 */
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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ARTIFACTS.map((artifact, i) => {
          const unlocked = completedIds.includes(artifact.sourceQuestId);
          const quest = QUEST_BY_ID[artifact.sourceQuestId];
          const style = RARITY_STYLE[artifact.rarity];
          if (!unlocked) {
            return (
              <Card key={artifact.id} className="p-4 border-dashed border-wood-light/30 bg-cream-200/40">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="lock" size={18} className="text-ink-faint" />
                  <RarityBadge rarity={artifact.rarity} />
                </div>
                <p className="text-sm font-semibold text-ink-faint">未铸造的神器</p>
                <p className="mt-1 text-xs text-ink-faint">完成 {quest ? `${quest.code} · ${quest.title}` : "对应任务"} 后铸造</p>
              </Card>
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
  const prompts = showcasePromptsFor(artifact);
  const quest = QUEST_BY_ID[artifact.sourceQuestId];
  const sections: Array<{ title: string; body: string; copyable?: string }> = [
    { title: "它证明了什么", body: artifact.proves },
    { title: "职业价值", body: artifact.careerValue },
    { title: "面试讲法", body: prompts.interview, copyable: prompts.interview },
    { title: "简历要点（可直接粘贴）", body: prompts.resume, copyable: prompts.resume },
    { title: "作品集建议", body: prompts.portfolio },
  ];

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
      {sections.map((sec) => (
        <div key={sec.title} className="rounded-xl bg-cream-200/50 p-4">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h3 className="text-xs font-bold text-ink-soft">{sec.title}</h3>
            {sec.copyable && <CopyButton text={sec.copyable} />}
          </div>
          <p className="text-sm text-ink whitespace-pre-wrap">{sec.body}</p>
        </div>
      ))}
      {/* 展示 Prompt */}
      <div className="rounded-xl border border-plum/30 bg-plum/5 p-4 space-y-3">
        <h3 className="text-xs font-bold text-plum-deep flex items-center gap-1.5">
          <Icon name="sparkle" size={13} />
          展示 Prompt（复制给 AI 帮你起草，不会自动发布任何内容）
        </h3>
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-ink-soft">LinkedIn 草稿 Prompt</p>
            <CopyButton text={prompts.linkedin} />
          </div>
          <p className="text-xs text-ink-soft line-clamp-3">{prompts.linkedin}</p>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-ink-soft">博客大纲 Prompt</p>
            <CopyButton text={prompts.blog} />
          </div>
          <p className="text-xs text-ink-soft line-clamp-3">{prompts.blog}</p>
        </div>
      </div>
    </div>
  );
}
