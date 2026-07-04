import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { getRecommendedQuest } from "@/engine/questEngine";
import { selectCompletedIds, usePlayerStore } from "@/store/playerStore";

/**
 * 深度冲刺面板 — 三个明确状态：
 * idle（选择了深度模式但未开始）→ active（显式开始后）→ ended（刚结束，指向回顾）。
 * 仅在 idle/active/ended 相关时渲染；日常模式下什么都不显示。
 */
export function SprintPanel() {
  const energyMode = usePlayerStore((s) => s.energyMode);
  const sprint = usePlayerStore((s) => s.sprint);
  const startSprint = usePlayerStore((s) => s.startSprint);
  const endSprint = usePlayerStore((s) => s.endSprint);
  const completedIds = usePlayerStore(selectCompletedIds);

  const [justEnded, setJustEnded] = useState<{ hadQuests: boolean } | null>(null);

  const nextQuest = getRecommendedQuest(completedIds);

  // ---- active：冲刺进行中 ----
  if (sprint) {
    return (
      <div className="rounded-2xl border border-ember/50 bg-gradient-to-r from-ember/15 to-ember/5 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm font-bold text-ember-deep">
            <Icon name="flame" size={18} className="animate-flicker" />
            深度冲刺进行中：已完成 {sprint.questIds.length} 个任务
          </p>
          <div className="flex gap-2">
            {nextQuest && (
              <Link to={`/quests/${nextQuest.id}`}>
                <Button size="sm">
                  继续下一关
                  <Icon name="chevron-right" size={14} />
                </Button>
              </Link>
            )}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setJustEnded({ hadQuests: sprint.questIds.length > 0 });
                endSprint();
              }}
            >
              结束冲刺
            </Button>
          </div>
        </div>
        {sprint.questIds.length > 0 && (
          <p className="mt-1.5 text-xs text-ink-soft">
            本次冲刺累计：+{sprint.totals.xp} XP · +{sprint.totals.gold} 金币 · {sprint.artifactIds.length} 件神器
          </p>
        )}
      </div>
    );
  }

  // ---- ended：刚刚结束（本次会话内提示一次） ----
  if (justEnded) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-moss/40 bg-moss/10 px-5 py-3.5">
        <p className="flex items-center gap-2 text-sm font-medium text-moss-deep">
          <Icon name="check" size={16} />
          {justEnded.hadQuests ? "冲刺已结束，回顾已写入篝火日志。" : "冲刺已结束。这次没有完成任务——没关系，火还在。"}
        </p>
        <div className="flex gap-2">
          {justEnded.hadQuests && (
            <Link to="/journal?tab=recaps">
              <Button size="sm" variant="secondary">
                查看回顾
              </Button>
            </Link>
          )}
          <Button size="sm" variant="ghost" onClick={() => setJustEnded(null)}>
            知道了
          </Button>
        </div>
      </div>
    );
  }

  // ---- idle：深度模式已选，等待显式开始 ----
  if (energyMode === "deep") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-ember/50 bg-cream-50 px-5 py-3.5">
        <div>
          <p className="text-sm font-semibold text-ink">深度冲刺待命</p>
          <p className="text-xs text-ink-soft">开始后，完成的每一关都会计入冲刺回顾。规则不变：每关都要证据。</p>
        </div>
        <Button size="sm" onClick={startSprint}>
          <Icon name="flame" size={15} />
          开始冲刺
        </Button>
      </div>
    );
  }

  return null;
}
