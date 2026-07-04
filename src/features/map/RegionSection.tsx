import { Fragment } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getQuestStatus, getRegionProgress, getRegionQuests } from "@/engine/unlockEngine";
import type { Region, RegionVisibility } from "@/types/domain";

/**
 * 地图上的一个区域。
 * v0.2：当前区域高亮、当前任务醒目、完成节点安静、任务链以箭头连接（M0 → M1 → … → Boss）。
 */
export function RegionSection({
  region,
  visibility,
  completedIds,
  recommendedQuestId,
}: {
  region: Region;
  visibility: RegionVisibility;
  completedIds: readonly string[];
  recommendedQuestId: string | null;
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
            <p className="mt-2 text-xs text-ink-faint">
              {region.side ? "点燃炉火（R0）后开放 · 可选支线，不阻塞主线" : "完成上一区域的 Boss 之门后解锁"}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // 完全解锁
  const quests = getRegionQuests(region.id);
  const progress = getRegionProgress(region.id, completedIds);
  const complete = progress.total > 0 && progress.done === progress.total;
  const isCurrentRegion = quests.some((q) => q.id === recommendedQuestId);

  return (
    <Card
      elevated
      className={`relative sm:ml-12 p-5 ${
        complete
          ? "border-moss/40"
          : isCurrentRegion
            ? "!border-ember/60 ring-1 ring-ember/25 shadow-glow"
            : "border-wood-light/30"
      }`}
    >
      {/* 时间线节点 */}
      <span
        className={`hidden sm:flex absolute -left-[46px] top-6 h-7 w-7 items-center justify-center rounded-full border-2 ${
          complete
            ? "border-moss bg-moss/20 text-moss-deep"
            : isCurrentRegion
              ? "border-ember bg-ember/15 text-ember-deep shadow-glow"
              : "border-wood-light/50 bg-cream-100 text-ink-faint"
        }`}
        aria-hidden="true"
      >
        <Icon name={complete ? "check" : "flame"} size={14} />
      </span>

      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h3 className="text-base font-bold text-ink flex items-center gap-2 flex-wrap">
            {region.name} <span className="text-xs font-normal text-ink-faint">{region.nameEn}</span>
            {isCurrentRegion && <Badge tone="ember">当前区域</Badge>}
            {region.side && <Badge tone="stone">可选支线</Badge>}
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

      {/* 任务链：M0 → M1 → … → Boss */}
      <div className="flex flex-wrap items-center gap-y-2">
        {quests.map((quest, i) => {
          const info = getQuestStatus(quest, completedIds);
          const isBoss = quest.type === "boss";
          const isCurrent = quest.id === recommendedQuestId;
          const base = "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all";

          let chip;
          if (isCurrent) {
            chip = (
              <Link
                to={`/quests/${quest.id}`}
                className={`${base} border-ember bg-ember text-white shadow-glow hover:bg-ember-deep`}
              >
                <Icon name={isBoss ? "shield" : "hammer"} size={12} />
                {quest.code} {quest.title}
                <span className="rounded-full bg-white/25 px-1.5 text-[10px] font-bold">当前</span>
              </Link>
            );
          } else if (info.status === "completed") {
            chip = (
              <Link
                key={quest.id}
                to={`/quests/${quest.id}`}
                className={`${base} border-transparent bg-moss/10 text-moss-deep/90 hover:bg-moss/20`}
              >
                <Icon name="check" size={12} />
                {quest.code} {quest.title}
              </Link>
            );
          } else if (info.status === "available") {
            chip = (
              <Link
                to={`/quests/${quest.id}`}
                className={`${base} ${
                  isBoss
                    ? "border-ember/60 bg-ember/10 text-ember-deep hover:bg-ember/20"
                    : "border-ember/50 bg-cream-50 text-ink hover:border-ember hover:shadow-soft"
                }`}
              >
                <Icon name={isBoss ? "shield" : "hammer"} size={12} />
                {quest.code} {quest.title}
                {quest.optional && <span className="text-ink-faint">（可选）</span>}
              </Link>
            );
          } else {
            chip = (
              <span className={`${base} border-wood-light/25 bg-cream-200/40 text-ink-faint/80 cursor-not-allowed`} title="前置任务未完成">
                <Icon name="lock" size={11} />
                {quest.code} {quest.title}
              </span>
            );
          }

          return (
            <Fragment key={quest.id}>
              {/* 支线区域的任务相互独立，不画顺序箭头 */}
              {i > 0 && !region.side && (
                <Icon
                  name="chevron-right"
                  size={12}
                  className={`mx-1 shrink-0 ${info.status === "completed" ? "text-moss/60" : "text-wood-light/60"}`}
                  aria-hidden="true"
                />
              )}
              {i > 0 && region.side && <span className="w-1.5" aria-hidden="true" />}
              {chip}
            </Fragment>
          );
        })}
      </div>
    </Card>
  );
}
