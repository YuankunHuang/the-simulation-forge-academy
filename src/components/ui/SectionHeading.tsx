import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";

export function SectionHeading({
  icon,
  title,
  extra,
}: {
  icon?: IconName;
  title: string;
  extra?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-3">
      <h2 className="flex items-center gap-2 text-base font-bold text-ink">
        {icon && <Icon name={icon} size={18} className="text-wood" />}
        {title}
      </h2>
      {extra}
    </div>
  );
}
