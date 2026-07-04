import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    "bg-ember text-white shadow-soft hover:bg-ember-deep active:scale-[0.98] disabled:bg-ember/40 disabled:shadow-none",
  secondary:
    "bg-cream-50 text-wood-dark border border-wood-light/50 hover:border-wood hover:bg-cream-200 active:scale-[0.98] disabled:opacity-40",
  ghost: "text-ink-soft hover:bg-wood/10 active:scale-[0.98] disabled:opacity-40",
  danger: "bg-white text-red-700 border border-red-300 hover:bg-red-50 active:scale-[0.98] disabled:opacity-40",
};

const SIZE_CLASS: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5",
  md: "px-4 py-2 text-sm rounded-xl gap-2",
  lg: "px-6 py-3 text-base rounded-xl gap-2",
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
      className={`inline-flex items-center justify-center font-medium transition-all duration-150 select-none disabled:cursor-not-allowed ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
