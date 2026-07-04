import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getDueCards } from "@/engine/reviewEngine";
import { titleForCompleted, xpProgress } from "@/engine/rewardEngine";
import { LowEnergyPanel } from "@/features/hall/LowEnergyPanel";
import { ModeSelector } from "@/features/hall/ModeSelector";
import { SprintPanel } from "@/features/hall/SprintPanel";
import { computeMomentum, todayStr } from "@/lib/date";
import { formatNumber } from "@/lib/formatting";
import { SPRING_BOUNCY, popVariants } from "@/lib/motion";
import { getRecommendedQuest } from "@/engine/questEngine";
import { selectCompletedIds, usePlayerStore } from "@/store/playerStore";

/**
 * Duolingo 式外壳：顶部状态条（streak / 金币 / 等级三个弹层）+ 5 项底部导航。
 * 任务页（/quests/*）自动进入全屏专注模式，隐藏全部外壳。
 */

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "路径", icon: "map", end: true },
  { to: "/review", label: "复习", icon: "cards" },
  { to: "/skills", label: "技能", icon: "skilltree" },
  { to: "/vault", label: "宝库", icon: "chest" },
  { to: "/journal", label: "日志", icon: "book" },
];

const FLAME_LABEL = ["余烬", "小火苗", "稳定火焰", "旺火"] as const;

/** 数字从旧值滚到新值（状态条专用，避免每次从 0 起跳）。 */
function TickerNumber({ value, className = "" }: { value: number; className?: string }) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  const raf = useRef<number>();

  useEffect(() => {
    const from = prev.current;
    prev.current = value;
    if (reduced || from === value) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const duration = 650;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value, reduced]);

  return <span className={className}>{formatNumber(display)}</span>;
}

type PanelId = "flame" | "wallet" | "level";

function StatusPopover({
  open,
  onClose,
  children,
  labelledBy,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  labelledBy: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
          <motion.div
            role="dialog"
            aria-label={labelledBy}
            variants={popVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            className="absolute right-0 top-full z-50 mt-2 w-[min(340px,calc(100vw-24px))] max-h-[min(560px,75vh)] overflow-y-auto scrollbar-thin rounded-2xl border border-wood-light/30 bg-cream-50 p-4 shadow-card"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const wallet = usePlayerStore((s) => s.wallet);
  const reviewStates = usePlayerStore((s) => s.reviewStates);
  const activeDates = usePlayerStore((s) => s.activeDates);
  const energyMode = usePlayerStore((s) => s.energyMode);
  const completedIds = usePlayerStore(selectCompletedIds);

  const [panel, setPanel] = useState<PanelId | null>(null);

  const today = todayStr();
  const dueCount = getDueCards(reviewStates, completedIds, today).length;
  const progress = xpProgress(wallet.xp);
  const title = titleForCompleted(completedIds);
  const momentum = computeMomentum(activeDates, today);
  const recommended = getRecommendedQuest(completedIds);

  // 任务页全屏专注模式：隐藏顶部状态条与底部导航
  const focusMode = location.pathname.startsWith("/quests/");

  // 路由切换时收起弹层
  useEffect(() => {
    setPanel(null);
  }, [location.pathname]);

  const toggle = (id: PanelId) => setPanel((p) => (p === id ? null : id));

  if (focusMode) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen">
      {/* 顶部状态条（不加 backdrop-filter：它会成为弹层 fixed 遮罩的包含块） */}
      <header className="sticky top-0 z-30 border-b border-wood-light/25 bg-cream-50/95">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-ember shrink-0">
              <Icon name="flame" size={24} className="animate-flicker" />
            </span>
            <span className="truncate text-sm font-bold text-ink hidden sm:inline">仿真铸造学院</span>
          </div>

          {/* relative 放在按钮组上：弹层贴组右缘展开，窄屏不会溢出 */}
          <div className="relative flex items-center gap-1">
            {/* 动量之火 */}
            <div>
              <button
                type="button"
                onClick={() => toggle("flame")}
                aria-expanded={panel === "flame"}
                className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm font-bold transition-colors ${
                  panel === "flame" ? "bg-ember/15" : "hover:bg-wood/10"
                } ${momentum.level > 0 ? "text-ember-deep" : "text-stone2"}`}
                title="动量之火 · 节奏与冲刺"
              >
                <Icon name="flame" size={18} className={momentum.level > 0 ? "animate-flicker" : ""} />
                {momentum.streakDays > 0 ? momentum.streakDays : ""}
              </button>
              <StatusPopover open={panel === "flame"} onClose={() => setPanel(null)} labelledBy="动量之火与今日节奏">
                <div className="mb-3 flex items-center gap-3">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                      momentum.level > 0 ? "bg-ember/15 text-ember" : "bg-stone2/10 text-stone2"
                    }`}
                  >
                    <Icon name="flame" size={24} className={momentum.level > 0 ? "animate-flicker" : ""} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-ink">
                      {FLAME_LABEL[momentum.level]}
                      {momentum.streakDays > 0 && ` · 连续 ${momentum.streakDays} 天`}
                    </p>
                    <p className="text-xs text-ink-soft">
                      {momentum.streakDays > 0 ? "火还在烧。今天再添一块柴。" : "任何一个小行动都能重新点燃它。"}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <ModeSelector />
                  <SprintPanel />
                  {energyMode === "low" && <LowEnergyPanel questId={recommended?.id} />}
                </div>
              </StatusPopover>
            </div>

            {/* 金币（钱包） */}
            <div>
              <button
                type="button"
                onClick={() => toggle("wallet")}
                aria-expanded={panel === "wallet"}
                className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm font-bold text-ember-deep transition-colors ${
                  panel === "wallet" ? "bg-ember/15" : "hover:bg-wood/10"
                }`}
                title="钱包"
              >
                <motion.span key={wallet.gold} initial={{ scale: 1.45 }} animate={{ scale: 1 }} transition={SPRING_BOUNCY}>
                  <Icon name="coin" size={17} />
                </motion.span>
                <TickerNumber value={wallet.gold} />
              </button>
              <StatusPopover open={panel === "wallet"} onClose={() => setPanel(null)} labelledBy="资源钱包">
                <p className="mb-3 text-xs font-semibold text-ink-faint">学院资源</p>
                <ul className="space-y-2.5">
                  {(
                    [
                      { icon: "coin", label: "金币", desc: "秘境商店的通货", value: wallet.gold, tone: "text-ember-deep" },
                      { icon: "skilltree", label: "技能点", desc: "点亮技能树节点", value: wallet.skillPoints, tone: "text-skyblue-deep" },
                      { icon: "trophy", label: "声望", desc: "高质量展示证据的回报", value: wallet.reputation, tone: "text-moss-deep" },
                      { icon: "gem", label: "洞察", desc: "深度反思的结晶", value: wallet.insight, tone: "text-plum-deep" },
                    ] as const
                  ).map((r) => (
                    <li key={r.label} className="flex items-center gap-3 rounded-xl bg-cream-200/60 px-3 py-2.5">
                      <Icon name={r.icon} size={20} className={`shrink-0 ${r.tone}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink">{r.label}</p>
                        <p className="text-[11px] text-ink-faint">{r.desc}</p>
                      </div>
                      <span className="text-base font-bold text-ink">{formatNumber(r.value)}</span>
                    </li>
                  ))}
                </ul>
              </StatusPopover>
            </div>

            {/* 等级 + XP */}
            <div>
              <button
                type="button"
                onClick={() => toggle("level")}
                aria-expanded={panel === "level"}
                className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 transition-colors ${
                  panel === "level" ? "bg-plum/15" : "hover:bg-wood/10"
                }`}
                title={`${title.title} · 等级进度`}
              >
                <span className="text-sm font-bold text-plum-deep">Lv.{progress.level}</span>
                <span className="hidden sm:block h-1.5 w-14 overflow-hidden rounded-full bg-wood/10">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-plum-light to-plum transition-all duration-500"
                    style={{ width: `${progress.pct}%` }}
                  />
                </span>
              </button>
              <StatusPopover open={panel === "level"} onClose={() => setPanel(null)} labelledBy="等级与称号">
                <div className="mb-3">
                  <p className="text-sm font-bold text-ink">{title.title}</p>
                  <p className="text-[11px] text-ink-faint">{title.titleEn}</p>
                </div>
                <div className="mb-2 flex items-center justify-between text-xs text-ink-soft">
                  <span className="font-bold text-plum-deep">Lv.{progress.level}</span>
                  <span>
                    {progress.intoLevel} / {progress.needed} XP
                  </span>
                </div>
                <ProgressBar value={progress.intoLevel} max={progress.needed} tone="plum" label="等级进度" />
                <p className="mt-3 text-xs text-ink-faint">
                  称号随里程碑任务推进。每一份证据都在重写你的职业身份。
                </p>
              </StatusPopover>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="pb-24 lg:pb-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6">{children}</div>
      </main>

      {/* 底部导航：移动端满宽，桌面端居中悬浮胶囊 */}
      <nav
        className="fixed bottom-0 inset-x-0 z-30 flex items-stretch justify-around border-t border-wood-light/25 bg-cream-50/95 backdrop-blur-sm px-1 py-1.5
          lg:inset-x-auto lg:left-1/2 lg:-translate-x-1/2 lg:bottom-4 lg:rounded-full lg:border lg:border-wood-light/30 lg:shadow-card lg:px-2 lg:py-1.5 lg:gap-1"
        aria-label="主导航"
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-0.5 rounded-2xl px-3.5 py-1.5 text-[11px] font-semibold transition-colors lg:flex-row lg:gap-2 lg:px-4 lg:py-2 lg:text-sm lg:rounded-full ${
                isActive ? "text-ember-deep bg-ember/12" : "text-ink-faint hover:text-ink hover:bg-wood/5"
              }`
            }
          >
            <Icon name={item.icon} size={21} />
            <span>{item.label}</span>
            {item.to === "/review" && dueCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={SPRING_BOUNCY}
                className="absolute -top-0.5 right-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-ember px-1 text-[9px] font-bold text-white lg:static lg:ml-0.5 lg:h-5 lg:min-w-[20px] lg:text-[10px]"
              >
                {dueCount}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
