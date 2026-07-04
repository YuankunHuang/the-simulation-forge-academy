import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

/**
 * Duolingo 式 3D 按压按钮：实底 + 底边硬阴影。
 * 按下时下沉、底边收起，给每次点击真实的物理反馈。
 */
const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    "bg-ember text-white shadow-[0_4px_0_0_#C97F1B] hover:brightness-[1.06] " +
    "active:translate-y-[3px] active:shadow-[0_1px_0_0_#C97F1B] " +
    "disabled:bg-ember/40 disabled:shadow-none disabled:translate-y-0",
  secondary:
    "bg-cream-50 text-wood-dark border-2 border-wood-light/50 shadow-[0_4px_0_0_rgba(176,137,104,0.40)] " +
    "hover:border-wood hover:bg-cream-100 " +
    "active:translate-y-[3px] active:shadow-[0_1px_0_0_rgba(176,137,104,0.40)] " +
    "disabled:opacity-40 disabled:shadow-none disabled:translate-y-0",
  ghost:
    "text-ink-soft hover:bg-wood/10 active:translate-y-[2px] disabled:opacity-40 disabled:translate-y-0",
  danger:
    "bg-white text-red-700 border-2 border-red-300 shadow-[0_4px_0_0_rgba(252,165,165,0.6)] hover:bg-red-50 " +
    "active:translate-y-[3px] active:shadow-[0_1px_0_0_rgba(252,165,165,0.6)] " +
    "disabled:opacity-40 disabled:shadow-none disabled:translate-y-0",
};

const SIZE_CLASS: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-xl gap-1.5",
  md: "px-4 py-2 text-sm rounded-xl gap-2",
  lg: "px-6 py-3 text-base rounded-2xl gap-2",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

export function Button({ variant = "primary", size = "md", className = "", children, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center font-semibold select-none disabled:cursor-not-allowed transition-[transform,box-shadow,background-color,border-color,filter,opacity] duration-100 ease-out ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
