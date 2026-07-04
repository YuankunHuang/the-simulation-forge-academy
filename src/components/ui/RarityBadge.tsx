import { RARITY_LABEL, RARITY_STYLE } from "@/lib/formatting";
import type { Rarity } from "@/types/domain";

export function RarityBadge({ rarity }: { rarity: Rarity }) {
  const s = RARITY_STYLE[rarity];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${s.text} ${s.border} ${s.bg}`}>
      {RARITY_LABEL[rarity]}
    </span>
  );
}
