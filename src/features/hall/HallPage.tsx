import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { REGION_BY_ID } from "@/content/campaigns";
import { NPC_NAME, NPC_ROLE, pickDialogue } from "@/content/npcDialogues";
import { Icon, MiraAvatar, type IconName } from "@/components/icons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatPill } from "@/components/ui/StatPill";
import { getBlockedExplanation, getRecommendedQuest } from "@/engine/questEngine";
import { getDueCards } from "@/engine/reviewEngine";
import { titleForCompleted, xpProgress } from "@/engine/rewardEngine";
import { getCurrentRegion } from "@/engine/unlockEngine";
import { computeMomentum, timeOfDay, todayStr } from "@/lib/date";
import { QUEST_TYPE_LABEL } from "@/lib/formatting";
import { selectCompletedIds, usePlayerStore } from "@/store/playerStore";
import { LowEnergyPanel } from "./LowEnergyPanel";
import { ModeSelector } from "./ModeSelector";
import { MomentumFlame } from "./MomentumFlame";

/** 炉火大厅 — 每日驾驶舱。回答：我在哪、今天做什么、为什么。 */
export function HallPage() {
  const wallet = usePlayerStore((s) => s.wallet);
  const energyMode = usePlayerStore((s) => s.energyMode);
  const activeDates = usePlayerStore((s) => s.activeDates);
  const sprint = usePlayerStore((s) => s.sprint);
  const endSprint = usePlayerStore((s) => s.endSprint);
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

  // 米拉的问候：回归优先 → 模式 → 时段；再补一句区域风味
  const isReturning = activeDates.length > 0 && momentum.awayDays >= 3;
  let greeting = pickDialogue(`greeting_${timeOfDay()}`, daySeed)?.text ?? "";
  if (isReturning) greeting = pickDialogue("welcome_back", daySeed)?.text ?? greeting;
  else if (energyMode === "low") greeting = pickDialogue("low_energy", daySeed)?.text ?? greeting;
  else if (energyMode === "deep") greeting = pickDialogue("deep_start", daySeed)?.text ?? greeting;
  else if (recommended?.type === "boss") greeting = pickDialogue("boss_ahead", daySeed)?.text ?? greeting;
  else if (!recommended) greeting = pickDialogue("all_clear", daySeed)?.text ?? greeting;
  const flavor = pickDialogue("region_flavor", daySeed, currentRegion.id)?.text;

  const quickNav: Array<{ to: string; label: string; icon: IconName; badge?: number }> = [
    { to: "/map", label: "征程地图", icon: "map" },
    { to: "/skills", label: "技能树", icon: "skilltree" },
    { to: "/vault", label: "证据宝库", icon: "chest" },
    { to: "/review", label: "复习卡组", icon: "cards", badge: dueCount },
    { to: "/shop", label: "秘境商店", icon: "shop" },
    { to: "/journal", label: "篝火日志", icon: "book" },
  ];

  return (
    <div className="space-y-5">
      {/* 导师问候 */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card elevated className="p-5 sm:p-6 bg-gradient-to-br from-cream-50 to-cream-200/60">
          <div className="flex items-start gap-4">
            <MiraAvatar size={60} className="shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs text-ink-faint mb-1">
                <span className="font-semibold text-ink">{NPC_NAME}</span> · {NPC_ROLE}
              </p>
              <p className="text-[15px] leading-relaxed text-ink text-balance">{greeting}</p>
              {flavor && <p className="mt-2 text-xs text-ink-soft italic">「{flavor}」</p>}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* 角色状态 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-ink-faint mb-0.5">当前职业称号</p>
              <p className="text-base font-bold text-ink">{title.title}</p>
              <p className="text-xs text-ink-faint">{title.titleEn}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-plum-deep">Lv.{progress.level}</p>
              <p className="text-[11px] text-ink-faint">
                {progress.intoLevel}/{progress.needed} XP
              </p>
            </div>
          </div>
          <ProgressBar value={progress.intoLevel} max={progress.needed} tone="plum" label="等级进度" />
          <div className="mt-4 flex flex-wrap gap-2">
            <StatPill icon="coin" value={wallet.gold} label="金币" tone="gold" />
            <StatPill icon="skilltree" value={wallet.skillPoints} label="技能点" tone="skill" />
            <StatPill icon="trophy" value={wallet.reputation} label="声望" tone="rep" />
            <StatPill icon="gem" value={wallet.insight} label="洞察" tone="insight" />
          </div>
        </Card>
        <div className="space-y-3">
          <MomentumFlame />
          <ModeSelector />
          {sprint && (
            <div className="flex items-center justify-between rounded-xl border border-ember/40 bg-ember/10 px-4 py-2.5">
              <p className="text-sm text-ember-deep font-medium">
                冲刺进行中 · 已完成 {sprint.questIds.length} 个任务
              </p>
              <Button size="sm" variant="secondary" onClick={endSprint}>
                结束冲刺
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 低能量模式面板 */}
      {energyMode === "low" && <LowEnergyPanel questId={recommended?.id} />}

      {/* 今日推荐任务 */}
      <Card elevated className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold tracking-wider text-ember-deep uppercase">今日推荐</p>
          {recommended && <Badge tone={recommended.type === "boss" ? "ember" : "moss"}>{QUEST_TYPE_LABEL[recommended.type]}</Badge>}
        </div>
        {recommended ? (
          <>
            <div className="flex items-start gap-3 mb-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ember/15 text-ember-deep">
                <Icon name={recommended.type === "boss" ? "shield" : "hammer"} size={22} />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-ink">
                  {recommended.code} · {recommended.title}
                </h2>
                <p className="text-xs text-ink-faint">
                  {REGION_BY_ID[recommended.regionId]?.name}
                  {recommended.estimate && ` · 预计 ${recommended.estimate}`}
                </p>
              </div>
            </div>
            <p className="text-sm text-ink-soft mb-1.5">{recommended.objective}</p>
            <p className="text-xs text-ink-faint italic mb-4 text-balance">「{recommended.narrativeHook}」</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link to={`/quests/${recommended.id}`} className="flex-1">
                <Button className="w-full">
                  <Icon name="hammer" size={16} />
                  进入工坊
                </Button>
              </Link>
              <Link to="/map" className="flex-1 sm:flex-none">
                <Button variant="secondary" className="w-full">
                  <Icon name="map" size={16} />
                  查看地图
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <p className="text-sm text-ink-soft">{getBlockedExplanation(completedIds)}</p>
        )}
        {dueCount > 0 && energyMode !== "low" && (
          <Link
            to="/review"
            className="mt-4 flex items-center gap-2 rounded-xl bg-skyblue/10 border border-skyblue/30 px-4 py-2.5 text-sm text-skyblue-deep hover:bg-skyblue/15 transition-colors"
          >
            <Icon name="cards" size={16} />
            今日小复习：{dueCount} 张卡片到期（几分钟就好，不抢主线）
          </Link>
        )}
      </Card>

      {/* 快捷入口 */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {quickNav.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="relative flex flex-col items-center gap-1.5 rounded-xl border border-wood-light/25 bg-cream-50 px-2 py-3.5 text-ink-soft shadow-soft hover:border-ember/40 hover:text-ember-deep hover:-translate-y-0.5 transition-all"
          >
            <Icon name={item.icon} size={22} />
            <span className="text-xs font-medium">{item.label}</span>
            {item.badge != null && item.badge > 0 && (
              <span className="absolute top-1.5 right-1.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ember px-1 text-[10px] font-bold text-white">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
