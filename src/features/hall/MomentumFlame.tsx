import { Icon } from "@/components/icons";
import { computeMomentum, todayStr } from "@/lib/date";
import { usePlayerStore } from "@/store/playerStore";

/** 动量之火 — 温和的连续性指示，不惩罚休息。 */

const FLAME_META = [
  { label: "余烬", desc: "火种还在。任何一个小行动都能让它重新亮起来。", color: "text-stone2", size: 24 },
  { label: "小火苗", desc: "火苗跳动着。保持小步前进就好。", color: "text-ember", size: 28 },
  { label: "稳定火焰", desc: "火焰稳定燃烧。你正在形成节奏。", color: "text-ember-deep", size: 32 },
  { label: "旺火", desc: "熔炉全开！这样的火焰能铸造任何东西。", color: "text-ember-deep", size: 36 },
] as const;

export function MomentumFlame() {
  const activeDates = usePlayerStore((s) => s.activeDates);
  const momentum = computeMomentum(activeDates, todayStr());
  const meta = FLAME_META[momentum.level];

  return (
    <div className="flex items-center gap-3 rounded-xl bg-cream-200/60 px-4 py-3">
      <span className={`${meta.color} ${momentum.level > 0 ? "animate-flicker" : ""}`}>
        <Icon name="flame" size={meta.size} />
      </span>
      <div>
        <p className="text-sm font-semibold text-ink">
          动量之火 · {meta.label}
          {momentum.streakDays > 0 && <span className="ml-1.5 text-xs font-normal text-ink-soft">连续 {momentum.streakDays} 天</span>}
        </p>
        <p className="text-xs text-ink-soft">{meta.desc}</p>
      </div>
    </div>
  );
}
