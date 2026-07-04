import { isoNow, todayStr } from "@/lib/date";
import type { PlayerState } from "@/types/domain";

/** 存档持久化：localStorage key、初始状态、导出/导入校验。 */

export const SAVE_STORAGE_KEY = "sfa-save-v1";
export const SAVE_VERSION = 1;
export const EXPORT_APP_TAG = "the-simulation-forge-academy";

export function createInitialPlayerState(): PlayerState {
  return {
    version: SAVE_VERSION,
    createdAt: isoNow(),
    lastActiveDate: todayStr(),
    activeDates: [],
    energyMode: "normal",
    wallet: { xp: 0, gold: 0, skillPoints: 0, reputation: 0, insight: 0 },
    questCompletions: {},
    unlockedSkillIds: [],
    purchasedDungeonIds: [],
    completedDungeonIds: [],
    reviewStates: {},
    journal: [],
    recaps: [],
    sprint: null,
    warmupClaims: {},
    lowEnergyDoneDate: null,
    playerName: "铸造者",
  };
}

export interface ExportedSave {
  app: string;
  version: number;
  exportedAt: string;
  state: PlayerState;
}

export function buildExportPayload(state: PlayerState): ExportedSave {
  return {
    app: EXPORT_APP_TAG,
    version: SAVE_VERSION,
    exportedAt: isoNow(),
    state,
  };
}

export interface ImportResult {
  ok: boolean;
  state?: PlayerState;
  error?: string;
}

/** 导入校验：结构与关键字段类型检查，失败返回友好错误。 */
export function parseImportedSave(json: string): ImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return { ok: false, error: "这不是有效的 JSON 文件。" };
  }
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, error: "存档格式不正确。" };
  }
  const payload = raw as Partial<ExportedSave>;
  if (payload.app !== EXPORT_APP_TAG) {
    return { ok: false, error: "这不是仿真铸造学院的存档文件。" };
  }
  if (payload.version !== SAVE_VERSION) {
    return { ok: false, error: `存档版本不兼容（期望 v${SAVE_VERSION}，实际 v${payload.version ?? "?"}）。` };
  }
  const state = payload.state as Partial<PlayerState> | undefined;
  if (
    !state ||
    typeof state !== "object" ||
    typeof state.wallet !== "object" ||
    state.wallet === null ||
    typeof state.questCompletions !== "object" ||
    state.questCompletions === null ||
    !Array.isArray(state.unlockedSkillIds) ||
    !Array.isArray(state.journal)
  ) {
    return { ok: false, error: "存档内容缺少关键字段，可能已损坏。" };
  }
  // 用初始状态兜底缺失的次要字段，最大化兼容
  const merged: PlayerState = { ...createInitialPlayerState(), ...(state as PlayerState) };
  return { ok: true, state: merged };
}
