import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";

export function EmptyState({
  icon = "sparkle",
  title,
  description,
  action,
}: {
  icon?: IconName;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <div className="mb-4 rounded-2xl bg-cream-200/80 p-4 text-wood">
        <Icon name={icon} size={32} />
      </div>
      <h3 className="text-base font-semibold text-ink mb-1">{title}</h3>
      {description && <p className="text-sm text-ink-soft max-w-sm text-balance">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
