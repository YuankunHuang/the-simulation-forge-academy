import type { ReactNode } from "react";

type Tone = "ember" | "moss" | "skyblue" | "plum" | "wood" | "stone" | "danger";

const TONE_CLASS: Record<Tone, string> = {
  ember: "bg-ember/15 text-ember-deep border-ember/30",
  moss: "bg-moss/15 text-moss-deep border-moss/30",
  skyblue: "bg-skyblue/15 text-skyblue-deep border-skyblue/30",
  plum: "bg-plum/15 text-plum-deep border-plum/30",
  wood: "bg-wood/10 text-wood-dark border-wood/25",
  stone: "bg-stone2/10 text-stone2 border-stone2/30",
  danger: "bg-red-50 text-red-700 border-red-200",
};

export function Badge({
  tone = "wood",
  children,
  className = "",
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${TONE_CLASS[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
