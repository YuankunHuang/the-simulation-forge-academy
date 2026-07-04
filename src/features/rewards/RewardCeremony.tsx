import confetti from "canvas-confetti";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
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
import { SPRING_BOUNCY, SPRING_GENTLE } from "@/lib/motion";
import { selectCompletedIds, usePlayerStore } from "@/store/playerStore";
import type { Artifact, CeremonyPayload } from "@/types/domain";

/**
 * 奖励仪式 — 全屏多幕庆祝序列（Duolingo 式）：
 * 胜利幕（彩带 + 大数字）→ 神器幕（翻牌揭示）→ 升级幕 → 战果幕。
 * 一幕只讲一件事，每幕一个「继续」。
 */

type Act =
  | { kind: "victory" }
  | { kind: "artifact"; artifact: Artifact }
  | { kind: "levelup" }
  | { kind: "results" };

const BRAND_COLORS = ["#E8A33D", "#F6C066", "#7A9E5F", "#9B7EBD", "#7FA7C9"];

function fireConfetti(big: boolean) {
  const base = { colors: BRAND_COLORS, disableForReducedMotion: true, zIndex: 200 };
  confetti({ ...base, particleCount: big ? 160 : 90, spread: big ? 100 : 70, origin: { y: 0.6 } });
  if (big) {
    window.setTimeout(() => {
      confetti({ ...base, particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } });
      confetti({ ...base, particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } });
    }, 250);
  }
}

export function RewardCeremony() {
  const ceremony = usePlayerStore((s) => s.ceremony);
  const closeCeremony = usePlayerStore((s) => s.closeCeremony);
  const sprint = usePlayerStore((s) => s.sprint);
  const endSprint = usePlayerStore((s) => s.endSprint);
  const completedIds = usePlayerStore(selectCompletedIds);
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  const [actIndex, setActIndex] = useState(0);

  const quest = ceremony ? QUEST_BY_ID[ceremony.questId] : null;
  const nextQuest = ceremony ? getNextQuest(completedIds, ceremony.questId) : null;

  const acts = useMemo<Act[]>(() => {
    if (!ceremony) return [];
    const artifacts = ceremony.artifactIds.map((id) => ARTIFACT_BY_ID[id]).filter(Boolean);
    const result: Act[] = [{ kind: "victory" }];
    for (const artifact of artifacts) result.push({ kind: "artifact", artifact });
    if (ceremony.leveledUpTo || ceremony.newTitle) result.push({ kind: "levelup" });
    result.push({ kind: "results" });
    return result;
  }, [ceremony]);

  // 新仪式开场：回到第一幕并放彩带
  useEffect(() => {
    if (!ceremony) return;
    setActIndex(0);
    if (!reduced) fireConfetti(quest?.type === "boss");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ceremony?.questId]);

  const act = acts[actIndex];

  const advance = () => {
    const next = acts[actIndex + 1];
    if (next?.kind === "levelup" && !reduced) fireConfetti(true);
    setActIndex((i) => Math.min(i + 1, acts.length - 1));
  };

  const exitTo = (path: string) => {
    closeCeremony();
    navigate(path);
  };

  const handleEndSprint = () => {
    endSprint();
    closeCeremony();
    navigate("/journal?tab=recaps");
  };

  return (
    <AnimatePresence>
      {ceremony && quest && act && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col bg-cream-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="任务完成奖励"
        >
          {/* 背景光晕 */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(700px 420px at 50% -8%, rgba(246,192,102,0.30), transparent 65%), radial-gradient(520px 380px at 15% 108%, rgba(155,126,189,0.14), transparent 60%)",
            }}
            aria-hidden="true"
          />

          {/* 幕进度点 */}
          {acts.length > 1 && (
            <div className="relative z-10 flex items-center justify-center gap-1.5 pt-5" aria-hidden="true">
              {acts.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === actIndex ? "w-6 bg-ember" : i < actIndex ? "w-1.5 bg-ember/50" : "w-1.5 bg-wood/20"
                  }`}
                />
              ))}
            </div>
          )}

          {/* 幕内容 */}
          <div className="relative z-10 flex-1 overflow-y-auto scrollbar-thin">
            <div className="mx-auto flex min-h-full w-full max-w-lg flex-col justify-center px-6 py-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={actIndex}
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.98, transition: { duration: 0.15 } }}
                  transition={SPRING_GENTLE}
                >
                  {act.kind === "victory" && <VictoryAct ceremony={ceremony} questType={quest.type} questLabel={`${quest.code} · ${quest.title}`} />}
                  {act.kind === "artifact" && <ArtifactAct artifact={act.artifact} />}
                  {act.kind === "levelup" && <LevelUpAct leveledUpTo={ceremony.leveledUpTo} newTitle={ceremony.newTitle} />}
                  {act.kind === "results" && (
                    <ResultsAct
                      ceremony={ceremony}
                      questType={quest.type}
                      showcaseSeed={quest.publicShowcaseSeed}
                      nextRisk={quest.nextRisk}
                      nextQuest={nextQuest}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* 底部操作区 */}
          <div className="relative z-10 border-t border-wood-light/20 bg-cream-50/90 backdrop-blur-sm">
            <div className="mx-auto w-full max-w-lg px-6 py-4">
              {act.kind !== "results" ? (
                <Button size="lg" className="w-full" onClick={advance}>
                  继续
                  <Icon name="chevron-right" size={17} />
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  {nextQuest ? (
                    <Button size="lg" className="w-full" onClick={() => exitTo(`/quests/${nextQuest.id}`)}>
                      {nextQuest.type === "boss" ? "挑战 Boss 之门" : "继续下一关"}
                      <Icon name="chevron-right" size={17} />
                    </Button>
                  ) : (
                    <Button size="lg" className="w-full" onClick={() => exitTo("/vault")}>
                      <Icon name="chest" size={17} />
                      查看证据宝库
                    </Button>
                  )}
                  <div className="flex gap-2">
                    <Button variant="secondary" className="flex-1" onClick={() => exitTo("/")}>
                      <Icon name="map" size={15} />
                      回到路径
                    </Button>
                    {ceremony.artifactIds.length > 0 && nextQuest && (
                      <Button variant="secondary" className="flex-1" onClick={() => exitTo("/vault")}>
                        <Icon name="chest" size={15} />
                        看宝库
                      </Button>
                    )}
                  </div>
                  {sprint && sprint.questIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleEndSprint}
                      className="mt-1 w-full text-center text-xs text-ink-faint transition-colors hover:text-ink"
                    >
                      结束冲刺并生成回顾 →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- 第一幕：胜利 ---------------- */

function VictoryAct({
  ceremony,
  questType,
  questLabel,
}: {
  ceremony: CeremonyPayload;
  questType: string;
  questLabel: string;
}) {
  const isBoss = questType === "boss";
  const rewards = (
    [
      { label: "XP", value: ceremony.rewards.xp, icon: "star", tone: "text-plum-deep" },
      { label: "金币", value: ceremony.rewards.gold, icon: "coin", tone: "text-ember-deep" },
      { label: "技能点", value: ceremony.rewards.skillPoints, icon: "skilltree", tone: "text-skyblue-deep" },
      { label: "声望", value: ceremony.rewards.reputation, icon: "trophy", tone: "text-moss-deep" },
      { label: "洞察", value: ceremony.rewards.insight, icon: "gem", tone: "text-plum-deep" },
    ] as const
  ).filter((r) => r.value > 0);

  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0.4, rotate: -10, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ ...SPRING_BOUNCY, delay: 0.08 }}
        className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-ember/15 text-ember shadow-glow-strong"
      >
        <Icon name={isBoss ? "shield" : "trophy"} size={48} />
      </motion.div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-ember-deep">
        {isBoss ? "Boss 之门开启" : "任务完成"}
      </p>
      <h2 className="text-2xl font-bold text-ink text-balance">{questLabel}</h2>

      <div className={`mx-auto mt-8 grid gap-2.5 ${rewards.length <= 2 ? "max-w-[280px] grid-cols-2" : "grid-cols-3"}`}>
        {rewards.map((r, i) => (
          <motion.div
            key={r.label}
            initial={{ opacity: 0, y: 18, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...SPRING_BOUNCY, delay: 0.25 + i * 0.09 }}
            className="rounded-2xl border border-wood-light/25 bg-cream-50 px-2 py-4 shadow-soft"
          >
            <Icon name={r.icon} size={22} className={`mx-auto mb-1.5 ${r.tone}`} />
            <span className="block text-2xl font-bold text-ink">
              +<CountUp value={r.value} duration={800} />
            </span>
            <span className="text-[11px] text-ink-faint">{r.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- 神器幕：翻牌揭示 ---------------- */

function ArtifactAct({ artifact }: { artifact: Artifact }) {
  const style = RARITY_STYLE[artifact.rarity];
  const reduced = useReducedMotion();
  return (
    <div className="text-center">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink-faint">
        New Evidence Collected · 新证据入库
      </p>
      <div style={{ perspective: 1100 }}>
        <motion.div
          initial={reduced ? { opacity: 0 } : { rotateY: 90, opacity: 0 }}
          animate={reduced ? { opacity: 1 } : { rotateY: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.15 }}
          className={`rounded-3xl border-2 bg-cream-50 p-6 text-left ${style.border} ${style.glow}`}
        >
          <div className="mb-4 flex items-center justify-between gap-2">
            <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${style.bg} ${style.text}`}>
              <Icon name="trophy" size={24} />
            </span>
            <RarityBadge rarity={artifact.rarity} />
          </div>
          <h3 className="text-lg font-bold text-ink">{artifact.name}</h3>
          <p className="mb-4 text-[11px] text-ink-faint">{artifact.nameEn}</p>
          <div className="space-y-3 text-sm text-ink-soft">
            <p>
              <span className="font-semibold text-ink">它证明了：</span>
              {artifact.proves}
            </p>
            <p>
              <span className="font-semibold text-ink">职业价值：</span>
              {artifact.careerValue}
            </p>
            <p>
              <span className="font-semibold text-ink">建议的下一步展示：</span>
              {artifact.linkedinSuggestion}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ---------------- 升级 / 晋升幕 ---------------- */

function LevelUpAct({ leveledUpTo, newTitle }: { leveledUpTo?: number; newTitle?: string }) {
  return (
    <div className="text-center">
      {leveledUpTo && (
        <>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-plum-deep">Level Up · 等级提升</p>
          <motion.p
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...SPRING_BOUNCY, delay: 0.1 }}
            className="text-7xl font-bold text-plum-deep"
          >
            Lv.{leveledUpTo}
          </motion.p>
        </>
      )}
      {newTitle && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_GENTLE, delay: leveledUpTo ? 0.45 : 0.1 }}
          className={leveledUpTo ? "mt-8" : ""}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink-faint">新称号 · 职业身份推进</p>
          <span className="inline-flex items-center gap-2 rounded-full border border-plum/30 bg-plum/15 px-5 py-2.5 text-base font-bold text-plum-deep">
            <Icon name="star" size={18} />
            {newTitle}
          </span>
        </motion.div>
      )}
      <p className="mt-8 text-sm text-ink-soft text-balance">你的证据正在重写你的简历。继续。</p>
    </div>
  );
}

/* ---------------- 战果幕 ---------------- */

function ResultsAct({
  ceremony,
  questType,
  showcaseSeed,
  nextRisk,
  nextQuest,
}: {
  ceremony: CeremonyPayload;
  questType: string;
  showcaseSeed?: string;
  nextRisk?: string;
  nextQuest: ReturnType<typeof getNextQuest>;
}) {
  const skills = ceremony.skillsMadeAvailable.map((id) => SKILL_BY_ID[id]).filter(Boolean);
  const reviewCards = (ceremony.reviewCardIds ?? []).map((id) => CARD_BY_ID[id]).filter(Boolean);

  return (
    <div className="space-y-4">
      <h2 className="text-center text-lg font-bold text-ink">战果清点</h2>

      {skills.length > 0 && (
        <div className="rounded-2xl border border-skyblue/30 bg-skyblue/5 p-4">
          <p className="mb-2 text-xs font-semibold text-skyblue-deep">技能证据就绪（去技能树点亮）</p>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1 rounded-full border border-skyblue/30 bg-cream-50 px-2.5 py-1 text-xs font-medium text-skyblue-deep"
              >
                <Icon name="sparkle" size={12} />
                {s.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {reviewCards.length > 0 && (
        <div className="rounded-2xl border border-wood-light/25 bg-cream-50 p-4">
          <p className="mb-2 text-xs font-semibold text-ink-faint">
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

      {ceremony.journalEntriesCreated > 0 && (
        <p className="flex items-center gap-1.5 px-1 text-xs text-ink-soft">
          <Icon name="book" size={13} className="shrink-0 text-wood" />
          {questType === "boss" ? "答辩全文已存入篝火日志（面试防线）。" : "你的反思已写入篝火日志。"}
        </p>
      )}

      {showcaseSeed && (
        <div className="rounded-2xl border border-plum/20 bg-plum/5 p-4">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-plum-deep">
            <Icon name="sparkle" size={12} />
            公开展示种子
          </p>
          <p className="text-xs text-ink-soft">{showcaseSeed}</p>
        </div>
      )}

      <div className="rounded-2xl bg-cream-200/60 p-4">
        {nextQuest ? (
          <>
            <p className="mb-1 text-xs font-semibold text-ink-faint">下一个任务</p>
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              {nextQuest.type === "boss" && (
                <span className="inline-flex items-center gap-1 text-ember-deep">
                  <Icon name="shield" size={14} />
                  Boss
                </span>
              )}
              {nextQuest.code} · {nextQuest.title}
            </p>
            <p className="mt-1 text-xs text-ink-soft">{nextQuest.objective}</p>
          </>
        ) : (
          <p className="text-sm text-ink-soft">当前可做的任务都完成了。去休息，或看看宝库里的战利品。</p>
        )}
        {nextRisk && (
          <p className="mt-2 border-t border-wood-light/30 pt-2 text-xs text-wood-dark">
            <span className="font-semibold">下一个风险：</span>
            {nextRisk}
          </p>
        )}
      </div>
    </div>
  );
}
