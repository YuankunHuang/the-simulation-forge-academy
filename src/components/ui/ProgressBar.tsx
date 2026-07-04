import { motion, useReducedMotion } from "framer-motion";
import { SPRING_GENTLE } from "@/lib/motion";

/** spring 填充的进度条，带一道缓慢扫过的高光。 */
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
  const reduced = useReducedMotion();
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
      <motion.div
        className={`relative h-full rounded-full overflow-hidden ${toneClass}`}
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={reduced ? { duration: 0 } : SPRING_GENTLE}
      >
        {pct > 0 && !reduced && (
          <span
            className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/35 to-transparent bg-[length:200%_100%]"
            aria-hidden="true"
          />
        )}
      </motion.div>
    </div>
  );
}
