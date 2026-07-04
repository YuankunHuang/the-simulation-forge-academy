import { MODE_LABEL } from "@/lib/formatting";
import { usePlayerStore } from "@/store/playerStore";
import type { EnergyMode } from "@/types/domain";

const MODES: EnergyMode[] = ["low", "normal", "deep"];

/** 今日玩法模式：低能量 / 日常 / 深度冲刺。 */
export function ModeSelector() {
  const mode = usePlayerStore((s) => s.energyMode);
  const setMode = usePlayerStore((s) => s.setEnergyMode);

  return (
    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="今日模式">
      {MODES.map((m) => {
        const meta = MODE_LABEL[m];
        const active = mode === m;
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setMode(m)}
            className={`rounded-xl border px-3 py-2.5 text-left transition-all ${
              active
                ? "border-ember bg-ember/10 shadow-soft"
                : "border-wood-light/30 bg-cream-50 hover:border-wood-light/60"
            }`}
          >
            <p className={`text-sm font-semibold ${active ? "text-ember-deep" : "text-ink"}`}>{meta.name}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-ink-soft hidden sm:block">{meta.desc}</p>
          </button>
        );
      })}
    </div>
  );
}
