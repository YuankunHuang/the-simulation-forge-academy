import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/** 全局 Provider：动画尊重系统的 prefers-reduced-motion 设置。 */
export function Providers({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
