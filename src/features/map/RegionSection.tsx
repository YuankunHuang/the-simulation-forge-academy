import { Link } from "react-router-dom";
import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getQuestStatus, getRegionProgress, getRegionQuests } from "@/engine/unlockEngine";
import type { Region, RegionVisibility } from "@/types/domain";

/** 地图上的一个区域：解锁 = 完整卡片；预览 = 剪影；迷雾 = 不渲染（由上层隐藏）。 */
export function RegionSection({
  region,
  visibility,
  completedIds,
}: {
  region: Region;
  visibility: RegionVisibility;
  completedIds: readonly string[];
}) {
  if (visibility === "fogged") {
    return (
      <Card className="relative sm:ml-12 overflow-hidden border-dashed border-wood-light/30 bg-cream-200/40 p-5">
        <div className="flex items-center gap-3 text-ink-faint">
          <Icon name="fog" size={24} />
          <div>
            <p className="text-sm font-semibold">？？？</p>
            <p className="text-xs">迷雾尚未散开</p>
          </div>
        </div>
      </Card>
    );
  }

  if (visibility === "preview") {
    return (
      <Card className="relative sm:ml-12 overflow-hidden border-wood-light/40 bg-gradient-to-br from-cream-200/80 to-cream-300/60 p-5">
        <div className="absolute top-4 right-4 text-ink-faint" aria-hidden="true">
          <Icon name="lock" size={20} />
        </div>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-wood/10 text-wood blur-[0.5px]">
            <Icon name="compass" size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-ink-soft">
              {region.name} <span className="text-xs font-normal text-ink-faint">{region.nameEn}</span>
            </p>
            <p className="mt-1 text-xs text-ink-faint italic">{region.vibe}</p>
            <p className="mt-2 text-xs text-ink-faint">完成上一区域的 Boss 之门后解锁</p>
          </div>
        </div>
      </Card>
    );
  }

  // 完全解锁
  const quests = getRegionQuests(region.id);
  const progress = getRegionProgress(region.id, completedIds);
  const complete = progress.total > 0 && progress.done === progress.total;

  return (
    <Card elevated className={`relative sm:ml-12 p-5 ${complete ? "border-moss/40" : "border-ember/30"}`}>
      {/* 时间线节点 */}
      <span
        className={`hidden sm:flex absolute -left-[46px] top-6 h-7 w-7 items-center justify-center rounded-full border-2 ${
          complete ? "border-moss bg-moss/20 text-moss-deep" : "border-ember bg-ember/15 text-ember-deep shadow-glow"
        }`}
        aria-hidden="true"
      >
        <Icon name={complete ? "check" : "flame"} size={14} />
      </span>

      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h3 className="text-base font-bold text-ink">
            {region.name} <span className="ml-1 text-xs font-normal text-ink-faint">{region.nameEn}</span>
          </h3>
          <p className="text-xs text-ink-soft mt-0.5">{region.description}</p>
        </div>
        {complete && <Badge tone="moss">已通关</Badge>}
      </div>

      {progress.total > 0 && (
        <div className="mb-4 flex items-center gap-3">
          <ProgressBar value={progress.done} max={progress.total} tone={complete ? "moss" : "ember"} className="flex-1" label={`${region.name}进度`} />
          <span className="text-xs font-medium text-ink-soft whitespace-nowrap">
            {progress.done}/{progress.total}
          </span>
        </div>
      )}

      {/* 任务节点 */}
      <div className="flex flex-wrap gap-2">
        {quests.map((quest) => {
          const info = getQuestStatus(quest, completedIds);
          const isBoss = quest.type === "boss";
          const base = "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all";
          if (info.status === "completed") {
            return (
              <Link key={quest.id} to={`/quests/${quest.id}`} className={`${base} border-moss/40 bg-moss/10 text-moss-deep hover:bg-moss/20`}>
                <Icon name="check" size={12} />
                {quest.code} {quest.title}
              </Link>
            );
          }
          if (info.status === "available") {
            return (
              <Link
                key={quest.id}
                to={`/quests/${quest.id}`}
                className={`${base} ${
                  isBoss
                    ? "border-ember bg-ember/15 text-ember-deep shadow-glow hover:bg-ember/25"
                    : "border-ember/50 bg-cream-50 text-ink hover:border-ember hover:shadow-soft"
                }`}
              >
                <Icon name={isBoss ? "shield" : "hammer"} size={12} />
                {quest.code} {quest.title}
                {quest.optional && <span className="text-ink-faint">（可选）</span>}
              </Link>
            );
          }
          return (
            <span key={quest.id} className={`${base} border-wood-light/30 bg-cream-200/50 text-ink-faint cursor-not-allowed`} title="前置任务未完成">
              <Icon name="lock" size={12} />
              {quest.code} {quest.title}
            </span>
          );
        })}
      </div>
    </Card>
  );
}
