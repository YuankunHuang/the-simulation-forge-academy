import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { REGION_BY_ID } from "@/content/campaigns";
import { NPC_NAME, pickDialogue, pickQuestFocusDialogue } from "@/content/npcDialogues";
import { Icon, MiraAvatar, type IconName } from "@/components/icons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getBlockedExplanation, getRecommendedQuest } from "@/engine/questEngine";
import { getDueCards } from "@/engine/reviewEngine";
import { titleForCompleted, xpProgress } from "@/engine/rewardEngine";
import { getCurrentRegion } from "@/engine/unlockEngine";
import { computeMomentum, timeOfDay, todayStr } from "@/lib/date";
import { QUEST_TYPE_LABEL, formatNumber } from "@/lib/formatting";
import { selectCompletedIds, usePlayerStore } from "@/store/playerStore";
import { LowEnergyPanel } from "./LowEnergyPanel";
import { ModeSelector } from "./ModeSelector";
import { SprintPanel } from "./SprintPanel";

/**
 * 炉火大厅 v0.2 — 焦点驾驶舱。
 * 视觉层级：导师问候 → 今日任务（主角）→ 节奏选择 → 进度条 → 次级入口。
 * 目标：3 秒内知道今天做什么。
 */
export function HallPage() {
  const wallet = usePlayerStore((s) => s.wallet);
  const energyMode = usePlayerStore((s) => s.energyMode);
  const activeDates = usePlayerStore((s) => s.activeDates);
  const sprint = usePlayerStore((s) => s.sprint);
  const reviewStates = usePlayerStore((s) => s.reviewStates);
  const completedIds = usePlayerStore(selectCompletedIds);

  const today = todayStr();
  const daySeed = Number(today.replace(/-/g, ""));
  const momentum = computeMomentum(activeDates, today);
  const progress = xpProgress(wallet.xp);
  const title = titleForCompleted(completedIds);
  const recommended = getRecommendedQuest(completedIds);
  const currentRegion = getCurrentRegion(completedIds);
  const dueCount = getDueCards(reviewStates, completedIds, today).length;

  // 米拉主句：回归 > 冲刺 > 低能量 > 任务专属 > Boss 前 > 全清 > 时段问候
  const isReturning = activeDates.length > 0 && momentum.awayDays >= 3;
  const questFocus = recommended ? pickQuestFocusDialogue(recommended.id)?.text : undefined;
  let greeting = pickDialogue(`greeting_${timeOfDay()}`, daySeed)?.text ?? "";
  if (isReturning) greeting = pickDialogue("welcome_back", daySeed)?.text ?? greeting;
  else if (sprint) greeting = pickDialogue("deep_start", daySeed)?.text ?? greeting;
  else if (energyMode === "low") greeting = pickDialogue("low_energy", daySeed)?.text ?? greeting;
  else if (questFocus) greeting = questFocus;
  else if (recommended?.type === "boss") greeting = pickDialogue("boss_ahead", daySeed)?.text ?? greeting;
  else if (!recommended) greeting = pickDialogue("all_clear", daySeed)?.text ?? greeting;
  const flavor = pickDialogue("region_flavor", daySeed, currentRegion.id)?.text;

  const requiredEvidenceCount = recommended
    ? recommended.evidenceRequired.filter((e) => !e.optional).length
    : 0;

  const secondaryNav: Array<{ to: string; label: string; icon: IconName; badge?: number }> = [
    { to: "/map", label: "地图", icon: "map" },
    { to: "/skills", label: "技能树", icon: "skilltree" },
    { to: "/vault", label: "证据宝库", icon: "chest" },
    { to: "/review", label: "复习卡组", icon: "cards", badge: dueCount },
    { to: "/shop", label: "秘境商店", icon: "shop" },
    { to: "/journal", label: "篝火日志", icon: "book" },
  ];

  const FLAME_LABEL = ["余烬", "小火苗", "稳定火焰", "旺火"] as const;

  return (
    <div className="space-y-4">
      {/* A. 导师横幅 — 一句主话 + 一行小字 */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start gap-3.5 rounded-2xl bg-gradient-to-r from-cream-200/80 to-transparent px-4 py-3.5">
          <MiraAvatar size={48} className="shrink-0" />
          <div className="min-w-0 pt-0.5">
            <p className="text-[15px] leading-relaxed text-ink text-balance">{greeting}</p>
            {flavor && (
              <p className="mt-1 text-xs text-ink-faint italic truncate">
                {NPC_NAME} ·「{flavor}」
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* 冲刺状态（idle/active/ended 由面板自判，日常模式不渲染） */}
      <SprintPanel />

      {/* B. 今日任务英雄卡 — 页面主角 */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
        {recommended ? (
          <Card
            elevated
            className="relative overflow-hidden !border-ember/40 p-6 sm:p-8 bg-gradient-to-br from-cream-50 via-cream-50 to-ember/10"
          >
            <div className="absolute -right-8 -top-8 text-ember/10" aria-hidden="true">
              <Icon name={recommended.type === "boss" ? "shield" : "hammer"} size={160} />
            </div>
            <div className="relative">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="rounded-lg bg-ember px-2.5 py-1 text-xs font-bold text-white">今日任务</span>
                <Badge tone={recommended.type === "boss" ? "ember" : "moss"}>
                  {QUEST_TYPE_LABEL[recommended.type]}
                </Badge>
                <span className="text-xs text-ink-faint">
                  {REGION_BY_ID[recommended.regionId]?.name}
                  {recommended.estimate && ` · 预计 ${recommended.estimate}`}
                </span>
                {sprint && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-ember/15 px-2 py-0.5 text-[11px] font-semibold text-ember-deep">
                    <Icon name="flame" size={11} />
                    冲刺中
                  </span>
                )}
                {!sprint && energyMode === "low" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-skyblue/15 px-2 py-0.5 text-[11px] font-semibold text-skyblue-deep">
                    低能量节奏
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-2">
                {recommended.code} · {recommended.title}
              </h1>
              <p className="text-sm text-ink-soft max-w-xl mb-4 text-balance">{recommended.whyItMatters.split("。")[0]}。</p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-5 text-xs text-ink-soft">
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="chest" size={14} className="text-wood" />
                  {requiredEvidenceCount} 项必交证据
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="star" size={14} className="text-plum-deep" />+{recommended.rewards.xp} XP
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="coin" size={14} className="text-ember-deep" />+{recommended.rewards.gold} 金币
                </span>
                {recommended.rewards.skillPoints > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="skilltree" size={14} className="text-skyblue-deep" />+{recommended.rewards.skillPoints} 技能点
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:max-w-md">
                <Link to={`/quests/${recommended.id}`} className="flex-[2]">
                  <Button size="lg" className="w-full">
                    <Icon name="hammer" size={18} />
                    进入工坊
                  </Button>
                </Link>
                <Link to="/map" className="flex-1">
                  <Button size="lg" variant="secondary" className="w-full">
                    查看地图
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          <Card elevated className="p-8 text-center">
            <Icon name="sparkle" size={32} className="mx-auto mb-3 text-ember" />
            <p className="text-sm text-ink-soft max-w-md mx-auto">{getBlockedExplanation(completedIds)}</p>
            <Link to="/vault" className="inline-block mt-4">
              <Button variant="secondary">看看宝库里的战利品</Button>
            </Link>
          </Card>
        )}
      </motion.div>

      {/* C. 节奏选择 + 低能量套餐 */}
      <Card className="p-4">
        <ModeSelector />
      </Card>
      {energyMode === "low" && <LowEnergyPanel questId={recommended?.id} />}

      {/* 今日小复习提示（不抢主线） */}
      {dueCount > 0 && energyMode !== "low" && (
        <Link
          to="/review"
          className="flex items-center gap-2 rounded-xl bg-skyblue/10 border border-skyblue/25 px-4 py-2.5 text-sm text-skyblue-deep hover:bg-skyblue/15 transition-colors"
        >
          <Icon name="cards" size={15} />
          顺手复习：{dueCount} 张卡到期，几分钟就好
        </Link>
      )}

      {/* D. 进度条 — 单行紧凑 */}
      <Card className="px-5 py-4">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink leading-tight">{title.title}</p>
            <p className="text-[11px] text-ink-faint">{title.titleEn}</p>
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-[160px]">
            <span className="text-sm font-bold text-plum-deep whitespace-nowrap">Lv.{progress.level}</span>
            <ProgressBar value={progress.intoLevel} max={progress.needed} tone="plum" className="flex-1" label="等级进度" />
            <span className="text-[11px] text-ink-faint whitespace-nowrap">
              {progress.intoLevel}/{progress.needed}
            </span>
          </div>
          <div className="flex items-center gap-3.5 text-sm" aria-label="资源">
            <span className="inline-flex items-center gap-1" title="金币">
              <Icon name="coin" size={15} className="text-ember-deep" />
              <span className="font-semibold">{formatNumber(wallet.gold)}</span>
            </span>
            <span className="inline-flex items-center gap-1" title="技能点">
              <Icon name="skilltree" size={15} className="text-skyblue-deep" />
              <span className="font-semibold">{wallet.skillPoints}</span>
            </span>
            <span className="inline-flex items-center gap-1" title="声望">
              <Icon name="trophy" size={15} className="text-moss-deep" />
              <span className="font-semibold">{wallet.reputation}</span>
            </span>
            <span className="inline-flex items-center gap-1" title="洞察宝石">
              <Icon name="gem" size={15} className="text-plum-deep" />
              <span className="font-semibold">{wallet.insight}</span>
            </span>
            <span
              className="inline-flex items-center gap-1"
              title={`动量之火 · ${FLAME_LABEL[momentum.level]}${momentum.streakDays > 0 ? `（连续 ${momentum.streakDays} 天）` : ""}`}
            >
              <Icon
                name="flame"
                size={16}
                className={momentum.level > 0 ? "text-ember animate-flicker" : "text-stone2"}
              />
              {momentum.streakDays > 0 && <span className="font-semibold">{momentum.streakDays}</span>}
            </span>
          </div>
        </div>
      </Card>

      {/* E. 次级入口 — 小而低调 */}
      <nav className="grid grid-cols-3 sm:grid-cols-6 gap-1.5" aria-label="学院设施">
        {secondaryNav.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="relative flex items-center justify-center gap-1.5 rounded-lg border border-wood-light/20 bg-cream-50/70 px-2 py-2 text-xs text-ink-soft hover:text-ember-deep hover:border-ember/30 transition-colors"
          >
            <Icon name={item.icon} size={15} />
            <span className="font-medium">{item.label}</span>
            {item.badge != null && item.badge > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-ember px-1 text-[9px] font-bold text-white">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}
