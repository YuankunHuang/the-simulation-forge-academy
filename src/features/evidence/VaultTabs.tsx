import { Link, useLocation } from "react-router-dom";
import { Icon } from "@/components/icons";

/** 宝库 / 秘境商店 的段选切换（两页共用，商店归入宝库入口）。 */
export function VaultTabs() {
  const { pathname } = useLocation();
  const tabs = [
    { to: "/vault", label: "证据神器", icon: "chest" as const },
    { to: "/shop", label: "秘境商店", icon: "shop" as const },
  ];
  return (
    <div className="grid grid-cols-2 gap-1 rounded-2xl bg-cream-200/70 p-1" role="tablist" aria-label="宝库分区">
      {tabs.map((tab) => {
        const active = pathname === tab.to;
        return (
          <Link
            key={tab.to}
            to={tab.to}
            role="tab"
            aria-selected={active}
            className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
              active ? "bg-cream-50 text-ember-deep shadow-soft" : "text-ink-soft hover:text-ink"
            }`}
          >
            <Icon name={tab.icon} size={15} />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
