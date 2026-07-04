import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";

/**
 * 可折叠段落卡 — 工坊长页面的抗疲劳设计：
 * 核心段落默认展开，参考型段落默认收起，标题栏永远可见。
 */
export function Collapsible({
  title,
  icon,
  iconClass = "text-wood",
  defaultOpen = false,
  badge,
  children,
}: {
  title: ReactNode;
  icon: IconName;
  iconClass?: string;
  defaultOpen?: boolean;
  badge?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const reduced = useReducedMotion();

  return (
    <div className="rounded-2xl bg-cream-50 border border-wood-light/25 shadow-soft overflow-hidden">
      {/* badge（如复制按钮）是头部的兄弟元素，避免嵌套可交互控件 */}
      <div className="flex items-center gap-2 pr-4 hover:bg-cream-200/40 transition-colors">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex flex-1 items-center gap-2 px-5 py-3.5 text-left min-w-0"
        >
          <Icon name={icon} size={16} className={`shrink-0 ${iconClass}`} />
          <span className="text-sm font-bold text-ink flex-1">{title}</span>
        </button>
        {badge}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "收起" : "展开"}
          className="shrink-0 rounded-lg p-1 text-ink-faint hover:text-ink transition-colors"
        >
          <Icon
            name="chevron-right"
            size={14}
            className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`}
          />
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduced ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="px-5 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
