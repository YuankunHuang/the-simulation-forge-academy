import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";
import { getDueCards } from "@/engine/reviewEngine";
import { titleForCompleted, xpProgress } from "@/engine/rewardEngine";
import { todayStr } from "@/lib/date";
import { formatNumber } from "@/lib/formatting";
import { selectCompletedIds, usePlayerStore } from "@/store/playerStore";

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "炉火大厅", icon: "home", end: true },
  { to: "/map", label: "征程地图", icon: "map" },
  { to: "/skills", label: "技能树", icon: "skilltree" },
  { to: "/vault", label: "证据宝库", icon: "chest" },
  { to: "/review", label: "复习卡组", icon: "cards" },
  { to: "/shop", label: "秘境商店", icon: "shop" },
  { to: "/journal", label: "篝火日志", icon: "book" },
];

function NavEntry({ item, dueCount }: { item: NavItem; dueCount: number }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        `relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
          isActive ? "bg-ember/15 text-ember-deep" : "text-ink-soft hover:bg-wood/10 hover:text-ink"
        }`
      }
    >
      <Icon name={item.icon} size={19} />
      <span>{item.label}</span>
      {item.to === "/review" && dueCount > 0 && (
        <span className="ml-auto inline-flex min-w-[20px] items-center justify-center rounded-full bg-ember px-1.5 py-0.5 text-[11px] font-bold text-white">
          {dueCount}
        </span>
      )}
    </NavLink>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const wallet = usePlayerStore((s) => s.wallet);
  const reviewStates = usePlayerStore((s) => s.reviewStates);
  const completedIds = usePlayerStore(selectCompletedIds);
  const dueCount = getDueCards(reviewStates, completedIds, todayStr()).length;
  const progress = xpProgress(wallet.xp);
  const title = titleForCompleted(completedIds);

  return (
    <div className="min-h-screen">
      {/* 桌面侧边栏 */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-60 flex-col gap-1 border-r border-wood-light/25 bg-cream-50/90 backdrop-blur-sm p-4 z-30">
        <div className="flex items-center gap-2.5 px-2 py-3 mb-2">
          <span className="text-ember">
            <Icon name="flame" size={28} className="animate-flicker" />
          </span>
          <div>
            <p className="text-sm font-bold text-ink leading-tight">仿真铸造学院</p>
            <p className="text-[11px] text-ink-faint leading-tight">Simulation Forge Academy</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1" aria-label="主导航">
          {NAV_ITEMS.map((item) => (
            <NavEntry key={item.to} item={item} dueCount={dueCount} />
          ))}
        </nav>
        <div className="mt-auto space-y-2 rounded-xl bg-cream-200/60 p-3">
          <p className="text-xs font-semibold text-wood-dark">{title.title}</p>
          <div className="flex items-center justify-between text-xs text-ink-soft">
            <span>Lv.{progress.level}</span>
            <span className="inline-flex items-center gap-1">
              <Icon name="coin" size={13} className="text-ember-deep" />
              {formatNumber(wallet.gold)}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-wood/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-plum-light to-plum transition-all duration-500"
              style={{ width: `${progress.pct}%` }}
            />
          </div>
        </div>
      </aside>

      {/* 移动端顶栏 */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-wood-light/25 bg-cream-50/95 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-ember">
            <Icon name="flame" size={22} className="animate-flicker" />
          </span>
          <span className="text-sm font-bold text-ink">仿真铸造学院</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-ink-soft">
          <span className="font-semibold">Lv.{progress.level}</span>
          <span className="inline-flex items-center gap-1">
            <Icon name="coin" size={13} className="text-ember-deep" />
            {formatNumber(wallet.gold)}
          </span>
        </div>
      </header>

      {/* 主内容 */}
      <main className="lg:pl-60 pb-20 lg:pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6">{children}</div>
      </main>

      {/* 移动端底部导航 */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 flex items-stretch justify-around border-t border-wood-light/25 bg-cream-50/95 backdrop-blur-sm px-1 py-1.5"
        aria-label="主导航"
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors ${
                isActive ? "text-ember-deep" : "text-ink-faint hover:text-ink"
              }`
            }
          >
            <Icon name={item.icon} size={20} />
            <span>{item.label.slice(0, 4)}</span>
            {item.to === "/review" && dueCount > 0 && (
              <span className="absolute -top-0.5 right-0 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-ember px-1 text-[9px] font-bold text-white">
                {dueCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
