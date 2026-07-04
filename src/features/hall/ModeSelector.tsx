import { MODE_LABEL } from "@/lib/formatting";
import { usePlayerStore } from "@/store/playerStore";
import type { EnergyMode } from "@/types/domain";

const MODES: EnergyMode[] = ["low", "normal", "deep"];

/**
 * 今日节奏选择：低能量 / 日常 / 深度冲刺。
 * 只改变推荐的呈现节奏，不会时间锁进度；深度冲刺需在下方显式开始。
 */
export function ModeSelector() {
  const mode = usePlayerStore((s) => s.energyMode);
  const setMode = usePlayerStore((s) => s.setEnergyMode);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-ink-soft">今日节奏</p>
        <p className="text-[11px] text-ink-faint">只影响推荐节奏，不锁进度</p>
      </div>
      <div
        className="grid grid-cols-3 gap-1 rounded-xl bg-cream-200/70 p-1"
        role="radiogroup"
        aria-label="今日节奏"
      >
        {MODES.map((m) => {
          const active = mode === m;
          return (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setMode(m)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                active ? "bg-cream-50 text-ember-deep shadow-soft" : "text-ink-soft hover:text-ink"
              }`}
            >
              {MODE_LABEL[m].name}
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 text-xs text-ink-faint">{MODE_LABEL[mode].desc}</p>
    </div>
  );
}
