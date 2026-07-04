import { motion } from "framer-motion";
import { QUEST_BY_ID } from "@/content/quests";
import { SKILLS_BY_TREE, SKILL_TREES } from "@/content/skills";
import { Icon } from "@/components/icons";
import { Card } from "@/components/ui/Card";
import { StatPill } from "@/components/ui/StatPill";
import { SPRING_BOUNCY } from "@/lib/motion";
import { selectCompletedIds, usePlayerStore } from "@/store/playerStore";
import type { SkillNode } from "@/types/domain";

/**
 * 技能树 — 证据驱动的解锁：
 * 锁定（无证据）→ 证据就绪（可花技能点点亮）→ 已点亮。
 */

type NodeState = "locked" | "future" | "ready" | "unlocked";

function getNodeState(node: SkillNode, completedIds: readonly string[], unlockedSkillIds: readonly string[]): NodeState {
  if (unlockedSkillIds.includes(node.id)) return "unlocked";
  if (node.sourceQuestIds.length === 0) return "future";
  if (node.sourceQuestIds.some((q) => completedIds.includes(q))) return "ready";
  return "locked";
}

const ACCENT_RING: Record<string, string> = {
  ember: "border-ember/60 bg-ember/10 text-ember-deep",
  skyblue: "border-skyblue/60 bg-skyblue/10 text-skyblue-deep",
  moss: "border-moss/60 bg-moss/10 text-moss-deep",
  wood: "border-wood/50 bg-wood/10 text-wood-dark",
  plum: "border-plum/60 bg-plum/10 text-plum-deep",
  stone: "border-stone2/50 bg-stone2/10 text-stone2",
};

function SkillNodeCard({ node, accent }: { node: SkillNode; accent: string }) {
  const completedIds = usePlayerStore(selectCompletedIds);
  const unlockedSkillIds = usePlayerStore((s) => s.unlockedSkillIds);
  const skillPoints = usePlayerStore((s) => s.wallet.skillPoints);
  const unlockSkill = usePlayerStore((s) => s.unlockSkill);

  const state = getNodeState(node, completedIds, unlockedSkillIds);
  const sourceLabels = node.sourceQuestIds
    .map((id) => QUEST_BY_ID[id])
    .filter(Boolean)
    .map((q) => q.code);

  if (state === "unlocked") {
    return (
      <motion.div
        initial={{ scale: 0.82, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={SPRING_BOUNCY}
        className={`relative rounded-xl border-2 p-3 ${ACCENT_RING[accent]} shadow-soft`}
      >
        <motion.span
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 1.35, opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="pointer-events-none absolute inset-0 rounded-xl border-2 border-current"
          aria-hidden="true"
        />
        <p className="flex items-center gap-1.5 text-sm font-bold">
          <Icon name="check" size={14} />
          {node.name}
        </p>
        <p className="mt-1 text-xs opacity-80">{node.description}</p>
      </motion.div>
    );
  }

  if (state === "ready") {
    const affordable = skillPoints >= node.cost;
    return (
      <motion.button
        type="button"
        whileHover={affordable ? { y: -2 } : undefined}
        whileTap={{ scale: 0.95 }}
        onClick={() => unlockSkill(node.id)}
        disabled={!affordable}
        className={`rounded-xl border-2 border-dashed p-3 text-left transition-all w-full ${
          affordable
            ? "border-ember bg-cream-50 hover:bg-ember/10 hover:shadow-glow cursor-pointer"
            : "border-wood-light/40 bg-cream-50 opacity-70 cursor-not-allowed"
        }`}
        title={affordable ? "花费 1 技能点点亮" : "技能点不足"}
      >
        <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
          <Icon name="sparkle" size={14} className="text-ember" />
          {node.name}
        </p>
        <p className="mt-1 text-xs text-ink-soft">{node.description}</p>
        <p className="mt-1.5 text-[11px] font-medium text-ember-deep">证据就绪 · 点击点亮（{node.cost} 技能点）</p>
      </motion.button>
    );
  }

  return (
    <div className="rounded-xl border border-wood-light/25 bg-cream-200/40 p-3 opacity-75">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-faint">
        <Icon name={state === "future" ? "fog" : "lock"} size={13} />
        {node.name}
      </p>
      <p className="mt-1 text-xs text-ink-faint">{node.description}</p>
      <p className="mt-1.5 text-[11px] text-ink-faint">
        {state === "future" ? "第二幕内容 · 迷雾中" : `证据来源：完成 ${sourceLabels.join(" 或 ")}`}
      </p>
    </div>
  );
}

export function SkillsPage() {
  const skillPoints = usePlayerStore((s) => s.wallet.skillPoints);
  const unlockedSkillIds = usePlayerStore((s) => s.unlockedSkillIds);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink flex items-center gap-2">
            <Icon name="skilltree" size={22} className="text-wood" />
            技能树
          </h1>
          <p className="text-sm text-ink-soft mt-1">技能只认证据：先用任务证明它，再花技能点点亮它。</p>
        </div>
        <div className="flex gap-2">
          <StatPill icon="skilltree" value={skillPoints} label="技能点" tone="skill" />
          <StatPill icon="check" value={unlockedSkillIds.length} label="已点亮" tone="rep" />
        </div>
      </header>

      {SKILL_TREES.map((tree) => {
        const nodes = SKILLS_BY_TREE[tree.id] ?? [];
        const tiers = [...new Set(nodes.map((n) => n.tier))].sort((a, b) => a - b);
        return (
          <Card key={tree.id} className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-base font-bold text-ink">{tree.name}</h2>
              <span className="text-xs text-ink-faint">{tree.nameEn}</span>
            </div>
            <div className="space-y-3">
              {tiers.map((tier, tierIdx) => (
                <div key={tier} className="relative">
                  {tierIdx > 0 && (
                    <div className="absolute -top-3 left-6 h-3 w-0.5 bg-wood-light/30" aria-hidden="true" />
                  )}
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {nodes
                      .filter((n) => n.tier === tier)
                      .map((node) => (
                        <SkillNodeCard key={node.id} node={node} accent={tree.accent} />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
