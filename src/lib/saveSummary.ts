import { levelForXp } from "@/engine/rewardEngine";
import type { ExportedSave } from "@/store/persistence";

/**
 * 存档摘要 — 从 exportSave() 产出的 JSON 里抽取给同步确认弹窗看的几个数字。
 * 纯函数，不依赖任何 store，方便单测。
 */
export interface RemoteSummary {
  level: number;
  completedCount: number;
  exportedAt: string;
}

export function summarizeSaveJson(json: string): RemoteSummary | null {
  try {
    const payload = JSON.parse(json) as Partial<ExportedSave>;
    const state = payload.state;
    if (!state || typeof state !== "object") return null;
    return {
      level: levelForXp(state.wallet?.xp ?? 0),
      completedCount: Object.keys(state.questCompletions ?? {}).length,
      exportedAt: payload.exportedAt ?? "",
    };
  } catch {
    return null;
  }
}
