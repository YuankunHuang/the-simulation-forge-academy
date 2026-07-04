import { motion } from "framer-motion";
import { CAMPAIGNS, REGIONS } from "@/content/campaigns";
import { Icon } from "@/components/icons";
import { getRegionVisibility } from "@/engine/unlockEngine";
import { selectCompletedIds, usePlayerStore } from "@/store/playerStore";
import { RegionSection } from "./RegionSection";

/**
 * 征程地图 — 带战争迷雾的战役地图。
 * 当前区域完全可见；下一区域仅剪影预览；更远区域藏于迷雾。
 */
export function MapPage() {
  const completedIds = usePlayerStore(selectCompletedIds);
  const visibility = getRegionVisibility(completedIds);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-xl font-bold text-ink flex items-center gap-2">
          <Icon name="compass" size={22} className="text-wood" />
          征程地图
        </h1>
        <p className="text-sm text-ink-soft mt-1">
          雾中的世界会随你的证据一点点展开。看不见的部分不需要担心——它们还不属于今天。
        </p>
      </header>

      {CAMPAIGNS.map((campaign) => {
        const regions = REGIONS.filter((r) => r.actId === campaign.id).sort((a, b) => a.order - b.order);
        const anyVisible = regions.some((r) => visibility[r.id] !== "fogged");
        return (
          <section key={campaign.id} aria-label={campaign.name}>
            <div className="mb-4 flex items-center gap-3">
              <h2 className={`text-base font-bold ${anyVisible ? "text-wood-dark" : "text-ink-faint"}`}>
                {campaign.name}
              </h2>
              <span className="text-xs text-ink-faint">{campaign.nameEn}</span>
            </div>
            {anyVisible ? (
              <div className="relative">
                {/* 蜿蜒路径连接线 */}
                <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-gradient-to-b from-ember/50 via-wood-light/40 to-transparent hidden sm:block" aria-hidden="true" />
                <div className="space-y-4">
                  {regions.map((region, i) => (
                    <motion.div
                      key={region.id}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ delay: Math.min(i * 0.05, 0.3) }}
                    >
                      <RegionSection region={region} visibility={visibility[region.id]} completedIds={completedIds} />
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-2xl border border-wood-light/20 bg-gradient-to-br from-cream-200/70 to-cream-300/50 p-8 text-center">
                <div className="absolute inset-0 opacity-40 animate-drift" aria-hidden="true">
                  <Icon name="fog" size={120} className="absolute -top-4 -left-4 text-wood-light/30" />
                  <Icon name="fog" size={90} className="absolute bottom-0 right-8 text-wood-light/30" />
                </div>
                <p className="relative text-sm font-semibold text-ink-faint">迷雾深处 · {campaign.nameEn}</p>
                <p className="relative mt-1 text-xs text-ink-faint italic">{campaign.tagline}</p>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
