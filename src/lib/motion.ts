import type { Transition, Variants } from "framer-motion";

/**
 * 全站动效令牌 — 统一的 spring 手感。
 * snappy：界面元素（弹层、popover、tab 切换）
 * gentle：页面与卡片入场
 * bouncy：庆祝时刻（奖励、节点、徽章）
 */

export const SPRING_SNAPPY: Transition = { type: "spring", stiffness: 420, damping: 32, mass: 0.8 };
export const SPRING_GENTLE: Transition = { type: "spring", stiffness: 240, damping: 28 };
export const SPRING_BOUNCY: Transition = { type: "spring", stiffness: 340, damping: 16 };

/** 页面级过渡（路由切换） */
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  enter: { opacity: 1, y: 0, transition: SPRING_GENTLE },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: "easeIn" } },
};

/** 列表容器：子元素依次弹入 */
export const staggerContainer: Variants = {
  initial: {},
  enter: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 14, scale: 0.96 },
  enter: { opacity: 1, y: 0, scale: 1, transition: SPRING_GENTLE },
};

/** 弹层 / popover */
export const popVariants: Variants = {
  initial: { opacity: 0, y: -6, scale: 0.95 },
  enter: { opacity: 1, y: 0, scale: 1, transition: SPRING_SNAPPY },
  exit: { opacity: 0, y: -4, scale: 0.97, transition: { duration: 0.12, ease: "easeIn" } },
};

/** 底部抽屉（bottom sheet） */
export const sheetVariants: Variants = {
  initial: { y: "100%" },
  enter: { y: 0, transition: SPRING_GENTLE },
  exit: { y: "100%", transition: { duration: 0.2, ease: "easeIn" } },
};

/** 方向感知的横向滑动（分步闯关流程） */
export const slideVariants = {
  initial: (dir: number) => ({ opacity: 0, x: dir >= 0 ? 56 : -56 }),
  enter: { opacity: 1, x: 0, transition: SPRING_GENTLE },
  exit: (dir: number) => ({ opacity: 0, x: dir >= 0 ? -40 : 40, transition: { duration: 0.15, ease: "easeIn" } }),
};
