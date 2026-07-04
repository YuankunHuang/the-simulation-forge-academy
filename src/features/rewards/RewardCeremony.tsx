import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ARTIFACT_BY_ID } from "@/content/artifacts";
import { QUEST_BY_ID } from "@/content/quests";
import { CARD_BY_ID } from "@/content/reviewCards";
import { SKILL_BY_ID } from "@/content/skills";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { CountUp } from "@/components/ui/CountUp";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { getNextQuest } from "@/engine/questEngine";
import { RARITY_STYLE } from "@/lib/formatting";
import { selectCompletedIds, usePlayerStore } from "@/store/playerStore";

/**
 * 奖励仪式覆盖层 — 任务完成后的庆祝时刻。
 * 展示奖励、神器（New Evidence Collected）、技能、下一步，并支持“继续冒险”。
 */
export function RewardCeremony() {
  const ceremony = usePlayerStore((s) => s.ceremony);
  const closeCeremony = usePlayerStore((s) => s.closeCeremony);
  const sprint = usePlayerStore((s) => s.sprint);
  const endSprint = usePlayerStore((s) => s.endSprint);
  const completedIds = usePlayerStore(selectCompletedIds);
  const navigate = useNavigate();

  const quest = ceremony ? QUEST_BY_ID[ceremony.questId] : null;
  const nextQuest = ceremony ? getNextQuest(completedIds, ceremony.questId) : null;
  const artifacts = ceremony ? ceremony.artifactIds.map((id) => ARTIFACT_BY_ID[id]).filter(Boolean) : [];
  const skills = ceremony ? ceremony.skillsMadeAvailable.map((id) => SKILL_BY_ID[id]).filter(Boolean) : [];
  const reviewCards = ceremony ? (ceremony.reviewCardIds ?? []).map((id) => CARD_BY_ID[id]).filter(Boolean) : [];

  const handleRest = () => {
    closeCeremony();
    navigate("/");
  };

  const handleContinue = () => {
    closeCeremony();
    if (nextQuest) navigate(`/quests/${nextQuest.id}`);
    else navigate("/map");
  };

  const handleViewVault = () => {
    closeCeremony();
    navigate("/vault");
  };

  const handleEndSprint = () => {
    endSprint();
    closeCeremony();
    navigate("/journal?tab=recaps");
  };

  return (
    <AnimatePresence>
      {ceremony && quest && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" aria-hidden="true" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="任务完成奖励"
            className="relative w-full max-w-lg max-h-[88vh] overflow-y-auto scrollbar-thin rounded-2xl bg-cream-50 shadow-card border border-ember/40 p-6 sm:p-8"
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", damping: 24, stiffness: 260 }}
          >
            {/* 标题 */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0.6, rotate: -8 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
                className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-ember/15 text-ember shadow-glow"
              >
                <Icon name={quest.type === "boss" ? "shield" : "trophy"} size={32} />
              </motion.div>
              <p className="text-xs font-semibold tracking-widest text-ember-deep uppercase mb-1">
                {quest.type === "boss" ? "Boss 之门开启" : "任务完成"}
              </p>
              <h2 className="text-xl font-bold text-ink">
                {quest.code} · {quest.title}
              </h2>
              {ceremony.newTitle && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-plum/15 border border-plum/30 px-3 py-1 text-sm font-semibold text-plum-deep"
                >
                  <Icon name="star" size={14} />
                  晋升：{ceremony.newTitle}
                </motion.p>
              )}
              {ceremony.leveledUpTo && (
                <p className="mt-1.5 text-sm font-semibold text-ember-deep">等级提升 → Lv.{ceremony.leveledUpTo}</p>
              )}
            </div>

            {/* 奖励数字 */}
            <div className="grid grid-cols-3 gap-2 mb-5 text-center sm:grid-cols-5">
              {(
                [
                  { label: "XP", value: ceremony.rewards.xp, icon: "star", tone: "text-plum-deep" },
                  { label: "金币", value: ceremony.rewards.gold, icon: "coin", tone: "text-ember-deep" },
                  { label: "技能点", value: ceremony.rewards.skillPoints, icon: "skilltree", tone: "text-skyblue-deep" },
                  { label: "声望", value: ceremony.rewards.reputation, icon: "trophy", tone: "text-moss-deep" },
                  { label: "洞察", value: ceremony.rewards.insight, icon: "gem", tone: "text-plum-deep" },
                ] as const
              )
                .filter((r) => r.value > 0)
                .map((r) => (
                  <div key={r.label} className="rounded-xl bg-cream-200/70 px-2 py-3">
                    <Icon name={r.icon} size={18} className={`mx-auto mb-1 ${r.tone}`} />
                    <CountUp value={r.value} className="block text-lg font-bold text-ink" />
                    <span className="text-[11px] text-ink-faint">{r.label}</span>
                  </div>
                ))}
            </div>

            {/* 神器 */}
            {artifacts.map((artifact) => (
              <motion.div
                key={artifact.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className={`mb-4 rounded-xl border p-4 ${RARITY_STYLE[artifact.rarity].border} ${RARITY_STYLE[artifact.rarity].bg} ${RARITY_STYLE[artifact.rarity].glow}`}
              >
                <p className="text-[11px] font-semibold tracking-widest text-ink-faint uppercase mb-1.5">
                  New Evidence Collected · 新证据入库
                </p>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="font-bold text-ink">{artifact.name}</h3>
                  <RarityBadge rarity={artifact.rarity} />
                </div>
                <p className="text-sm text-ink-soft mb-2">
                  <span className="font-semibold text-ink">它证明了：</span>
                  {artifact.proves}
                </p>
                <p className="text-sm text-ink-soft mb-2">
                  <span className="font-semibold text-ink">职业价值：</span>
                  {artifact.careerValue}
                </p>
                <p className="text-sm text-ink-soft">
                  <span className="font-semibold text-ink">建议的下一步展示：</span>
                  {artifact.linkedinSuggestion}
                </p>
              </motion.div>
            ))}

            {/* 技能证据就绪 */}
            {skills.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-ink-faint mb-2">技能证据就绪（去技能树点亮）</p>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <span
                      key={s.id}
                      className="inline-flex items-center gap-1 rounded-full bg-skyblue/10 border border-skyblue/30 px-2.5 py-1 text-xs font-medium text-skyblue-deep"
                    >
                      <Icon name="sparkle" size={12} />
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 复习卡入组 */}
            {reviewCards.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-ink-faint mb-2">
                  {reviewCards.length} 张知识卡进入复习卡组（会按记忆曲线回来找你）
                </p>
                <div className="space-y-1">
                  {reviewCards.map((c) => (
                    <p key={c.id} className="flex items-start gap-1.5 text-xs text-ink-soft">
                      <Icon name="cards" size={12} className="mt-0.5 shrink-0 text-skyblue-deep" />
                      {c.prompt}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* 下一步 */}
            <div className="rounded-xl bg-cream-200/60 p-4 mb-5">
              {nextQuest ? (
                <>
                  <p className="text-xs font-semibold text-ink-faint mb-1">下一个任务</p>
                  <p className="text-sm font-semibold text-ink flex items-center gap-2">
                    {nextQuest.type === "boss" && (
                      <span className="inline-flex items-center gap-1 text-ember-deep">
                        <Icon name="shield" size={14} />
                        Boss
                      </span>
                    )}
                    {nextQuest.code} · {nextQuest.title}
                  </p>
                  <p className="text-xs text-ink-soft mt-1">{nextQuest.objective}</p>
                </>
              ) : (
                <p className="text-sm text-ink-soft">当前可做的任务都完成了。去休息，或看看宝库里的战利品。</p>
              )}
              {quest.nextRisk && (
                <p className="mt-2 text-xs text-wood-dark border-t border-wood-light/30 pt-2">
                  <span className="font-semibold">下一个风险：</span>
                  {quest.nextRisk}
                </p>
              )}
            </div>

            {/* 按钮 */}
            <div className="flex flex-col sm:flex-row gap-2">
              {nextQuest && (
                <Button className="flex-1" onClick={handleContinue}>
                  继续下一关
                  <Icon name="chevron-right" size={16} />
                </Button>
              )}
              <Button variant="secondary" className="flex-1" onClick={handleRest}>
                <Icon name="flame" size={16} />
                回到炉火大厅
              </Button>
              {artifacts.length > 0 && (
                <Button variant="secondary" className="flex-1" onClick={handleViewVault}>
                  <Icon name="chest" size={16} />
                  查看证据宝库
                </Button>
              )}
            </div>
            {sprint && sprint.questIds.length > 0 && (
              <button
                type="button"
                onClick={handleEndSprint}
                className="mt-3 w-full text-center text-xs text-ink-faint hover:text-ink transition-colors"
              >
                结束冲刺并生成回顾 →
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
