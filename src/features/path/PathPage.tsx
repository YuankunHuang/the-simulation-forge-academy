import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { Link } from "react-router-dom";
import { CAMPAIGNS, REGIONS } from "@/content/campaigns";
import { NPC_NAME, pickDialogue, pickQuestFocusDialogue } from "@/content/npcDialogues";
import { Icon, MiraAvatar, type IconName } from "@/components/icons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getBlockedExplanation, getRecommendedQuest } from "@/engine/questEngine";
import {
  getQuestStatus,
  getRegionProgress,
  getRegionQuests,
  getRegionVisibility,
  type QuestStatusInfo,
} from "@/engine/unlockEngine";
import { timeOfDay, todayStr } from "@/lib/date";
import { QUEST_TYPE_LABEL } from "@/lib/formatting";
import { SPRING_BOUNCY, SPRING_GENTLE, popVariants } from "@/lib/motion";
import { selectCompletedIds, usePlayerStore } from "@/store/playerStore";
import type { Campaign, Quest, Region, RegionVisibility } from "@/types/domain";

/**
 * 征程路径 — Duolingo 式蜿蜒任务路径，学院的唯一主页。
 * 一条路统治一切：已完成的节点变金，当前节点呼吸浮动，
 * 未来藏在迷雾里。点节点弹出任务卡，一次只看一件事。
 */

/** 蛇形偏移（px）：0 → 右 → 更右 → 右 → 0 → 左 → 更左 → 左 → 循环 */
const SNAKE_PATTERN = [0, 1, 2, 1, 0, -1, -2, -1];
const SNAKE_STEP = 40;

function snakeOffset(index: number): number {
  return SNAKE_PATTERN[index % SNAKE_PATTERN.length] * SNAKE_STEP;
}

type PathRow =
  | { kind: "campaign"; campaign: Campaign }
  | { kind: "region"; region: Region; visibility: RegionVisibility; done: number; total: number }
  | { kind: "quest"; quest: Quest; status: QuestStatusInfo; snakeIndex: number }
  | { kind: "fog"; campaign: Campaign };

export function PathPage() {
  const completedIds = usePlayerStore(selectCompletedIds);
  const energyMode = usePlayerStore((s) => s.energyMode);
  const sprint = usePlayerStore((s) => s.sprint);
  const activeDates = usePlayerStore((s) => s.activeDates);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [miraClicks, setMiraClicks] = useState(0);

  const visibility = useMemo(() => getRegionVisibility(completedIds), [completedIds]);
  const recommended = useMemo(() => getRecommendedQuest(completedIds), [completedIds]);

  // 铺平成行：战役横幅 → 区域横幅 → 任务节点；蛇形序号跨区域连续
  const rows = useMemo<PathRow[]>(() => {
    const result: PathRow[] = [];
    let snakeIndex = 0;
    for (const campaign of CAMPAIGNS) {
      const regions = REGIONS.filter((r) => r.actId === campaign.id).sort((a, b) => a.order - b.order);
      const anyVisible = regions.some((r) => visibility[r.id] !== "fogged");
      if (!anyVisible) {
        result.push({ kind: "fog", campaign });
        continue;
      }
      result.push({ kind: "campaign", campaign });
      for (const region of regions) {
        const vis = visibility[region.id];
        if (vis === "fogged") continue;
        const progress = getRegionProgress(region.id, completedIds);
        result.push({ kind: "region", region, visibility: vis, done: progress.done, total: progress.total });
        if (vis !== "unlocked") continue;
        for (const quest of getRegionQuests(region.id)) {
          result.push({ kind: "quest", quest, status: getQuestStatus(quest, completedIds), snakeIndex });
          snakeIndex++;
        }
      }
    }
    return result;
  }, [visibility, completedIds]);

  // 米拉的话：回归 > 冲刺 > 低能量 > 任务专属 > Boss 前 > 全清 > 时段问候（点头像换一句）
  const today = todayStr();
  const daySeed = Number(today.replace(/-/g, "")) + miraClicks;
  const greeting = useMemo(() => {
    const isReturning = activeDates.length > 0 && (() => {
      const sorted = [...activeDates].sort();
      const last = sorted[sorted.length - 1];
      return last < today && Math.abs(Date.parse(today) - Date.parse(last)) >= 3 * 86_400_000;
    })();
    const questFocus = recommended ? pickQuestFocusDialogue(recommended.id)?.text : undefined;
    if (isReturning) return pickDialogue("welcome_back", daySeed)?.text ?? "";
    if (sprint) return pickDialogue("deep_start", daySeed)?.text ?? "";
    if (energyMode === "low") return pickDialogue("low_energy", daySeed)?.text ?? "";
    if (questFocus && miraClicks === 0) return questFocus;
    if (recommended?.type === "boss") return pickDialogue("boss_ahead", daySeed)?.text ?? "";
    if (!recommended) return pickDialogue("all_clear", daySeed)?.text ?? "";
    return pickDialogue(`greeting_${timeOfDay()}`, daySeed)?.text ?? "";
  }, [activeDates, today, daySeed, recommended, sprint, energyMode, miraClicks]);

  // 自动定位到当前节点
  const currentNodeRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const t = window.setTimeout(() => {
      currentNodeRef.current?.scrollIntoView({ block: "center", behavior: "auto" });
    }, 60);
    return () => window.clearTimeout(t);
    // 仅首次挂载时定位
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="pb-8" onClick={() => setSelectedId(null)}>
      {/* 全清状态 */}
      {!recommended && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border border-moss/40 bg-moss/10 p-5 text-center"
        >
          <Icon name="sparkle" size={28} className="mx-auto mb-2 text-moss-deep" />
          <p className="text-sm text-ink-soft max-w-md mx-auto text-balance">{getBlockedExplanation(completedIds)}</p>
          <Link to="/vault" className="inline-block mt-3" onClick={(e) => e.stopPropagation()}>
            <Button variant="secondary" size="sm">
              看看宝库里的战利品
            </Button>
          </Link>
        </motion.div>
      )}

      <div className="space-y-3">
        {rows.map((row) => {
          switch (row.kind) {
            case "campaign":
              return <CampaignBanner key={`c_${row.campaign.id}`} campaign={row.campaign} />;
            case "region":
              return (
                <RegionBanner
                  key={`r_${row.region.id}`}
                  region={row.region}
                  visibility={row.visibility}
                  done={row.done}
                  total={row.total}
                />
              );
            case "fog":
              return <FogBanner key={`f_${row.campaign.id}`} campaign={row.campaign} />;
            case "quest": {
              const isCurrent = row.quest.id === recommended?.id;
              return (
                <div key={row.quest.id}>
                  {/* 米拉在当前节点前出现 */}
                  {isCurrent && (
                    <MiraBubble
                      text={greeting}
                      onCycle={() => setMiraClicks((c) => c + 1)}
                    />
                  )}
                  <QuestNode
                    quest={row.quest}
                    status={row.status}
                    isCurrent={isCurrent}
                    offset={snakeOffset(row.snakeIndex)}
                    selected={selectedId === row.quest.id}
                    onSelect={() => setSelectedId((id) => (id === row.quest.id ? null : row.quest.id))}
                    nodeRef={isCurrent ? currentNodeRef : undefined}
                  />
                </div>
              );
            }
          }
        })}
      </div>
    </div>
  );
}

/* ---------------- 横幅 ---------------- */

function CampaignBanner({ campaign }: { campaign: Campaign }) {
  return (
    <div className="pt-4 pb-1 text-center">
      <p className="text-xs font-bold tracking-widest text-wood-dark uppercase">{campaign.name}</p>
      <p className="text-[11px] text-ink-faint">{campaign.nameEn}</p>
    </div>
  );
}

function RegionBanner({
  region,
  visibility,
  done,
  total,
}: {
  region: Region;
  visibility: RegionVisibility;
  done: number;
  total: number;
}) {
  const complete = total > 0 && done === total;

  if (visibility === "preview") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        className="relative overflow-hidden rounded-2xl border border-dashed border-wood-light/40 bg-gradient-to-br from-cream-200/70 to-cream-300/50 px-5 py-4 my-2"
      >
        <div className="absolute inset-0 opacity-30 animate-drift" aria-hidden="true">
          <Icon name="fog" size={80} className="absolute -top-2 -left-2 text-wood-light/40" />
          <Icon name="fog" size={60} className="absolute bottom-0 right-6 text-wood-light/40" />
        </div>
        <div className="relative flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-wood/10 text-ink-faint">
            <Icon name="lock" size={18} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink-soft">
              {region.name} <span className="text-xs font-normal text-ink-faint">{region.nameEn}</span>
            </p>
            <p className="text-xs text-ink-faint italic truncate">{region.vibe}</p>
            <p className="text-[11px] text-ink-faint mt-0.5">
              {region.side ? "点燃炉火（R0）后开放 · 可选支线" : "完成上一区域的 Boss 之门后解锁"}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={SPRING_GENTLE}
      className={`flex items-center gap-3 rounded-2xl px-5 py-3.5 my-2 border ${
        complete
          ? "border-moss/40 bg-moss/10"
          : "border-ember/30 bg-gradient-to-r from-ember/10 to-transparent"
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-ink flex items-center gap-2 flex-wrap">
          {region.name}
          <span className="text-[11px] font-normal text-ink-faint">{region.nameEn}</span>
          {region.side && <Badge tone="stone">可选支线</Badge>}
        </p>
        <p className="text-xs text-ink-soft truncate">{region.description}</p>
      </div>
      {total > 0 && (
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
            complete ? "bg-moss/20 text-moss-deep" : "bg-cream-50 text-wood-dark border border-wood-light/30"
          }`}
        >
          {complete ? "已通关" : `${done}/${total}`}
        </span>
      )}
    </motion.div>
  );
}

function FogBanner({ campaign }: { campaign: Campaign }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-wood-light/20 bg-gradient-to-br from-cream-200/70 to-cream-300/50 p-6 text-center my-2">
      <div className="absolute inset-0 opacity-40 animate-drift" aria-hidden="true">
        <Icon name="fog" size={100} className="absolute -top-4 -left-4 text-wood-light/30" />
        <Icon name="fog" size={70} className="absolute bottom-0 right-8 text-wood-light/30" />
      </div>
      <p className="relative text-sm font-semibold text-ink-faint">迷雾深处 · {campaign.nameEn}</p>
      <p className="relative mt-1 text-xs text-ink-faint italic">{campaign.tagline}</p>
    </div>
  );
}

/* ---------------- 米拉气泡 ---------------- */

function MiraBubble({ text, onCycle }: { text: string; onCycle: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={SPRING_GENTLE}
      className="mx-auto mb-12 flex max-w-md items-start gap-3 px-2"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={onCycle}
        className="shrink-0 transition-transform hover:scale-105 active:scale-95"
        title={`${NPC_NAME} · 点我换一句`}
        aria-label="换一句米拉的话"
      >
        <MiraAvatar size={48} />
      </button>
      <div className="relative mt-1 rounded-2xl rounded-tl-sm border border-wood-light/30 bg-cream-50 px-4 py-3 shadow-soft">
        <AnimatePresence mode="wait">
          <motion.p
            key={text}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="text-sm leading-relaxed text-ink text-balance"
          >
            {text}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ---------------- 任务节点 ---------------- */

const NODE_STYLE = {
  completed:
    "bg-ember text-white shadow-[0_5px_0_0_#C97F1B] hover:brightness-105",
  current:
    "bg-ember text-white shadow-[0_5px_0_0_#C97F1B,0_0_24px_rgba(232,163,61,0.5)]",
  available:
    "bg-cream-50 text-ember-deep border-[3px] border-ember/50 shadow-[0_5px_0_0_rgba(176,137,104,0.4)] hover:border-ember",
  locked:
    "bg-cream-300 text-stone2 shadow-[0_5px_0_0_rgba(143,136,123,0.35)]",
} as const;

function nodeIcon(quest: Quest, status: QuestStatusInfo["status"]): IconName {
  if (status === "completed") return "check";
  if (status === "locked") return "lock";
  if (quest.type === "boss") return "shield";
  if (quest.type === "reflection") return "quill";
  if (quest.type === "training" || quest.type === "drill") return "scroll";
  return "hammer";
}

function QuestNode({
  quest,
  status,
  isCurrent,
  offset,
  selected,
  onSelect,
  nodeRef,
}: {
  quest: Quest;
  status: QuestStatusInfo;
  isCurrent: boolean;
  offset: number;
  selected: boolean;
  onSelect: () => void;
  nodeRef?: RefObject<HTMLDivElement>;
}) {
  const isBoss = quest.type === "boss";
  const styleKey = isCurrent ? "current" : status.status;
  const size = isBoss ? "h-20 w-20" : "h-16 w-16";
  const iconSize = isBoss ? 34 : 26;

  return (
    <div ref={nodeRef} className={`relative flex justify-center py-2.5 ${selected ? "z-30" : "z-0"}`}>
      <div className="relative" style={{ transform: `translateX(${offset}px)` }}>
        {/* 当前节点的「开始」气泡 */}
        {isCurrent && (
          <span className="absolute -top-9 left-1/2 -translate-x-1/2" aria-hidden="true">
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...SPRING_BOUNCY, delay: 0.25 }}
              className="block"
            >
              <span className="relative block animate-bob whitespace-nowrap rounded-xl border-2 border-ember bg-cream-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-ember-deep">
                开始
                <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-ember" />
              </span>
            </motion.span>
          </span>
        )}
        {/* 当前节点的呼吸光环 */}
        {isCurrent && (
          <span
            className={`absolute left-0 top-0 ${size} rounded-full bg-ember/40 animate-pulse-ring`}
            aria-hidden="true"
          />
        )}
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={SPRING_BOUNCY}
          whileTap={{ scale: 0.9, y: 3 }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          aria-label={`${quest.code} ${quest.title} · ${QUEST_TYPE_LABEL[quest.type]}`}
          aria-expanded={selected}
          className={`relative flex ${size} items-center justify-center rounded-full transition-[filter,border-color] duration-150 ${NODE_STYLE[styleKey]}`}
        >
          <Icon name={nodeIcon(quest, status.status)} size={iconSize} />
          {quest.optional && status.status !== "completed" && (
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-wood-light/40 bg-cream-50 text-[9px] font-bold text-ink-faint">
              选
            </span>
          )}
        </motion.button>
        {/* 节点下的小编号 */}
        <p
          className={`mt-1.5 text-center text-[10px] font-bold ${
            status.status === "locked" ? "text-ink-faint/60" : "text-wood-dark"
          }`}
          aria-hidden="true"
        >
          {quest.code}
        </p>
      </div>

      {/* 任务卡 popover（锚定在整行下方，箭头指向节点）。
          定位与动画分离：外层负责居中，内层 motion 负责弹出，避免 transform 相互覆盖。 */}
      <AnimatePresence>
        {selected && (
          <div
            className="absolute top-[calc(100%-4px)] left-1/2 z-40 w-[min(330px,calc(100vw-32px))] -translate-x-1/2"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div variants={popVariants} initial="initial" animate="enter" exit="exit" className="relative">
              <span
                className="absolute -top-[7px] h-3.5 w-3.5 rotate-45 rounded-[3px] border-l border-t border-wood-light/40 bg-cream-50"
                style={{ left: `calc(50% + ${offset}px - 7px)` }}
                aria-hidden="true"
              />
              <QuestPopoverCard quest={quest} status={status} isCurrent={isCurrent} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuestPopoverCard({
  quest,
  status,
  isCurrent,
}: {
  quest: Quest;
  status: QuestStatusInfo;
  isCurrent: boolean;
}) {
  const isBoss = quest.type === "boss";
  const requiredCount = quest.evidenceRequired.filter((e) => !e.optional).length;

  return (
    <div className="rounded-2xl border border-wood-light/40 bg-cream-50 p-4 shadow-card">
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <Badge tone={isBoss ? "ember" : "moss"}>{QUEST_TYPE_LABEL[quest.type]}</Badge>
        {status.status === "completed" && <Badge tone="moss">已完成</Badge>}
        {quest.optional && <Badge tone="stone">可选</Badge>}
        {quest.estimate && <span className="text-[11px] text-ink-faint">预计 {quest.estimate}</span>}
      </div>
      <h3 className="text-base font-bold text-ink leading-snug">
        {quest.code} · {quest.title}
      </h3>
      <p className="mt-1 text-xs text-ink-soft line-clamp-2">{quest.whyItMatters.split("。")[0]}。</p>

      {status.status === "locked" ? (
        <div className="mt-3 rounded-xl bg-cream-200/60 p-3 text-xs text-ink-soft">
          <p className="flex items-center gap-1.5 font-semibold text-ink mb-1">
            <Icon name="lock" size={13} />
            这扇门还没打开
          </p>
          {status.regionLocked && <p>先完成上一区域的 Boss 之门。</p>}
          {status.missingPrereqIds.length > 0 && <p>先完成前面的 {status.missingPrereqIds.length} 个任务。</p>}
        </div>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft">
            <span className="inline-flex items-center gap-1">
              <Icon name="star" size={13} className="text-plum-deep" />+{quest.rewards.xp} XP
            </span>
            <span className="inline-flex items-center gap-1">
              <Icon name="coin" size={13} className="text-ember-deep" />+{quest.rewards.gold}
            </span>
            {quest.rewards.skillPoints > 0 && (
              <span className="inline-flex items-center gap-1">
                <Icon name="skilltree" size={13} className="text-skyblue-deep" />+{quest.rewards.skillPoints}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Icon name="chest" size={13} className="text-wood" />
              {requiredCount} 项证据
            </span>
          </div>
          <Link to={`/quests/${quest.id}`} className="mt-3 block">
            <Button size="lg" className="w-full" variant={status.status === "completed" ? "secondary" : "primary"}>
              <Icon name={isBoss ? "shield" : "hammer"} size={17} />
              {status.status === "completed" ? "重温任务" : isCurrent ? "开始任务" : "进入工坊"}
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}
