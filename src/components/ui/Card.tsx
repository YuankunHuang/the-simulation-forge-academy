import type { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** 提升卡片：更强阴影 */
  elevated?: boolean;
}

export function Card({ children, elevated = false, className = "", ...rest }: CardProps) {
  return (
    <div
      className={`rounded-2xl bg-cream-50 border border-wood-light/25 ${elevated ? "shadow-card" : "shadow-soft"} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
