import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/** 数字滚动动画（尊重 prefers-reduced-motion）。 */
export function CountUp({ value, duration = 900, className = "" }: { value: number; duration?: number; className?: string }) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? value : 0);
  const raf = useRef<number>();

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value, duration, reduced]);

  return <span className={className}>{display.toLocaleString("zh-CN")}</span>;
}
