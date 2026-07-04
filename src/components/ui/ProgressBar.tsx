export function ProgressBar({
  value,
  max,
  tone = "ember",
  className = "",
  label,
}: {
  value: number;
  max: number;
  tone?: "ember" | "moss" | "skyblue" | "plum";
  className?: string;
  label?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const toneClass = {
    ember: "bg-gradient-to-r from-ember-light to-ember",
    moss: "bg-gradient-to-r from-moss-light to-moss",
    skyblue: "bg-gradient-to-r from-skyblue-light to-skyblue",
    plum: "bg-gradient-to-r from-plum-light to-plum",
  }[tone];
  return (
    <div
      className={`h-2.5 w-full rounded-full bg-wood/10 overflow-hidden ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      <div className={`h-full rounded-full transition-all duration-500 ${toneClass}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
