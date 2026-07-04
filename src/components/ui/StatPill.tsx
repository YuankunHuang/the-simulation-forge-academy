import { Icon, type IconName } from "@/components/icons";
import { formatNumber } from "@/lib/formatting";

const TONE: Record<string, string> = {
  xp: "text-plum-deep",
  gold: "text-ember-deep",
  skill: "text-skyblue-deep",
  rep: "text-moss-deep",
  insight: "text-plum-deep",
};

export function StatPill({
  icon,
  value,
  label,
  tone = "gold",
}: {
  icon: IconName;
  value: number;
  label: string;
  tone?: keyof typeof TONE;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-cream-200/80 border border-wood-light/25 px-3 py-1 text-sm"
      title={label}
      aria-label={`${label}：${value}`}
    >
      <Icon name={icon} size={15} className={TONE[tone]} />
      <span className="font-semibold text-ink">{formatNumber(value)}</span>
      <span className="text-xs text-ink-faint hidden sm:inline">{label}</span>
    </span>
  );
}
