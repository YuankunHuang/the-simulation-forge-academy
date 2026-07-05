import { useEffect, useRef } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { CloudSyncError, fetchRemoteSave, pushRemoteSave, testPassphrase } from "@/lib/cloudSyncApi";
import { type RemoteSummary, summarizeSaveJson } from "@/lib/saveSummary";
import { usePlayerStore } from "@/store/playerStore";

export type { RemoteSummary } from "@/lib/saveSummary";

/**
 * cloudSyncStore — 云端存档同步的口令与同步状态。
 * 独立的 localStorage key，故意不和主存档（sfa-save-v1）混在一起：
 * 导出/导入本地存档 JSON 时绝不会带出这个口令。
 */

const CLOUD_SYNC_STORAGE_KEY = "sfa-cloud-sync-v1";

type SyncStatus = "idle" | "syncing" | "error";

/** 启动对账的结论，便于单测断言与调试。 */
export type ReconcileAction = "pulled" | "pushed" | "none";

interface CloudSyncStore {
  passphrase: string | null;
  autoSyncEnabled: boolean;
  lastSyncedAt: string | null;
  /** 本机进度最后一次变化的时间基准（ISO）。推/拉成功后与服务器 savedAt 对齐。 */
  lastLocalChangeAt: string | null;
  lastError: string | null;
  status: SyncStatus;

  connect: (passphrase: string) => Promise<{ ok: boolean; error?: string }>;
  disconnect: () => void;
  setAutoSync: (enabled: boolean) => void;

  /** 记录一次本机进度变化（由 useCloudAutoSync 的订阅调用）。 */
  markLocalChange: () => void;

  pushNow: () => Promise<{ ok: boolean; error?: string }>;
  pullNow: () => Promise<{ ok: boolean; error?: string }>;
  /** 只读探视远程存档摘要，不覆盖本机——用于确认弹窗展示。 */
  peekRemote: () => Promise<{ ok: boolean; error?: string; summary?: RemoteSummary | null; json?: string }>;

  /**
   * 启动对账：比较云端 savedAt 与本地 lastLocalChangeAt——
   * 云端更新 → 自动拉取覆盖本机；本地更新 → 推送补齐云端；云端 404 → 推送本地。
   * 本地时间基准未知（升级后首启）时退回保守策略：仅全新存档才拉取。
   */
  reconcileOnStartup: () => Promise<{ action: ReconcileAction; error?: string }>;
}

export const useCloudSyncStore = create<CloudSyncStore>()(
  persist(
    (set, get) => ({
      passphrase: null,
      autoSyncEnabled: true,
      lastSyncedAt: null,
      lastLocalChangeAt: null,
      lastError: null,
      status: "idle",

      connect: async (passphrase) => {
        set({ status: "syncing", lastError: null });
        const ok = await testPassphrase(passphrase);
        if (!ok) {
          set({ status: "error", lastError: "口令不正确，请检查后重试。" });
          return { ok: false, error: "口令不正确，请检查后重试。" };
        }
        set({ passphrase, status: "idle", lastError: null });
        return { ok: true };
      },

      disconnect: () =>
        set({ passphrase: null, lastSyncedAt: null, lastLocalChangeAt: null, lastError: null, status: "idle" }),

      setAutoSync: (enabled) => set({ autoSyncEnabled: enabled }),

      markLocalChange: () => set({ lastLocalChangeAt: new Date().toISOString() }),

      pushNow: async () => {
        const { passphrase } = get();
        if (!passphrase) return { ok: false, error: "尚未连接云端存档。" };
        set({ status: "syncing" });
        try {
          const json = usePlayerStore.getState().exportSave();
          const result = await pushRemoteSave(passphrase, json);
          // 推送成功后把本地时间基准对齐到服务器 savedAt，避免本机时钟偏差累积
          set({ status: "idle", lastSyncedAt: result.savedAt, lastLocalChangeAt: result.savedAt, lastError: null });
          return { ok: true };
        } catch (err) {
          const message = err instanceof CloudSyncError ? err.message : "同步失败，请稍后再试。";
          set({ status: "error", lastError: message });
          return { ok: false, error: message };
        }
      },

      pullNow: async () => {
        const { passphrase } = get();
        if (!passphrase) return { ok: false, error: "尚未连接云端存档。" };
        set({ status: "syncing" });
        try {
          const remote = await fetchRemoteSave(passphrase);
          const result = usePlayerStore.getState().importSave(remote.json);
          if (!result.ok) {
            set({ status: "error", lastError: result.error ?? "云端存档格式不正确。" });
            return { ok: false, error: result.error };
          }
          const syncedAt = remote.savedAt ?? new Date().toISOString();
          set({ status: "idle", lastSyncedAt: syncedAt, lastLocalChangeAt: syncedAt, lastError: null });
          return { ok: true };
        } catch (err) {
          const message = err instanceof CloudSyncError ? err.message : "同步失败，请稍后再试。";
          set({ status: "error", lastError: message });
          return { ok: false, error: message };
        }
      },

      peekRemote: async () => {
        const { passphrase } = get();
        if (!passphrase) return { ok: false, error: "尚未连接云端存档。" };
        try {
          const remote = await fetchRemoteSave(passphrase);
          return { ok: true, summary: summarizeSaveJson(remote.json), json: remote.json };
        } catch (err) {
          if (err instanceof CloudSyncError && err.kind === "not_found") {
            return { ok: true, summary: null, json: undefined };
          }
          const message = err instanceof CloudSyncError ? err.message : "连接云端失败。";
          return { ok: false, error: message };
        }
      },

      reconcileOnStartup: async () => {
        const { passphrase, lastLocalChangeAt, pushNow } = get();
        if (!passphrase) return { action: "none" as const };
        set({ status: "syncing" });
        try {
          const remote = await fetchRemoteSave(passphrase);
          const remoteAt = remote.savedAt ? Date.parse(remote.savedAt) : Number.NaN;
          const localAt = lastLocalChangeAt ? Date.parse(lastLocalChangeAt) : Number.NaN;
          const localIsFresh = Object.keys(usePlayerStore.getState().questCompletions).length === 0;

          const applyRemote = (): { action: ReconcileAction; error?: string } => {
            const result = usePlayerStore.getState().importSave(remote.json);
            if (!result.ok) {
              set({ status: "error", lastError: result.error ?? "云端存档格式不正确。" });
              return { action: "none", error: result.error };
            }
            const syncedAt = remote.savedAt ?? new Date().toISOString();
            set({ status: "idle", lastSyncedAt: syncedAt, lastLocalChangeAt: syncedAt, lastError: null });
            return { action: "pulled" };
          };

          // 本地时间基准未知（升级后首启或异常清除）：只有全新存档才安全拉取，
          // 有进度但没基准时按兵不动，等下一次本机改动自然建立基准并推送。
          if (Number.isNaN(localAt)) {
            if (localIsFresh) return applyRemote();
            set({ status: "idle" });
            return { action: "none" };
          }

          if (!Number.isNaN(remoteAt) && remoteAt > localAt) {
            // 云端更新（另一台设备推过更新的进度）→ 自动拉取覆盖本机
            return applyRemote();
          }
          if (Number.isNaN(remoteAt) || remoteAt < localAt) {
            // 本地更新（例如上次离开前的补推没送达）→ 推送补齐云端
            const result = await pushNow();
            return result.ok ? { action: "pushed" as const } : { action: "none" as const, error: result.error };
          }
          set({ status: "idle" });
          return { action: "none" };
        } catch (err) {
          if (err instanceof CloudSyncError && err.kind === "not_found") {
            // 云端还没有存档 → 用本机进度建立云端基准
            const result = await pushNow();
            return result.ok ? { action: "pushed" as const } : { action: "none" as const, error: result.error };
          }
          const message = err instanceof CloudSyncError ? err.message : "同步失败，请稍后再试。";
          set({ status: "error", lastError: message });
          return { action: "none", error: message };
        }
      },
    }),
    {
      name: CLOUD_SYNC_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        passphrase: state.passphrase,
        autoSyncEnabled: state.autoSyncEnabled,
        lastSyncedAt: state.lastSyncedAt,
        lastLocalChangeAt: state.lastLocalChangeAt,
      }),
    },
  ),
);

const AUTO_PUSH_DEBOUNCE_MS = 4000;

/**
 * 自动同步策略（在 App 根部挂载一次）：
 * - 启动对账：比较云端 savedAt 与本地最后改动时间，云端新则自动拉取，
 *   本地新（或云端为空）则推送——任何设备打开都是最新进度。
 * - 本机进度变化后防抖自动推送；离开页面前补推一次，保证不丢最后一手改动。
 */
export function useCloudAutoSync() {
  const passphrase = useCloudSyncStore((s) => s.passphrase);
  const autoSyncEnabled = useCloudSyncStore((s) => s.autoSyncEnabled);
  const pushNow = useCloudSyncStore((s) => s.pushNow);
  const reconcileOnStartup = useCloudSyncStore((s) => s.reconcileOnStartup);

  const debounceRef = useRef<number>();
  const triedInitialReconcile = useRef(false);

  // 启动对账：自动加载最新存档
  useEffect(() => {
    if (!passphrase || !autoSyncEnabled || triedInitialReconcile.current) return;
    triedInitialReconcile.current = true;
    void reconcileOnStartup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passphrase, autoSyncEnabled]);

  // 记录本机进度变化的时间基准（拉取云端导致的变化不算本机改动）
  useEffect(() => {
    const unsubscribe = usePlayerStore.subscribe(() => {
      const sync = useCloudSyncStore.getState();
      if (sync.status !== "syncing") sync.markLocalChange();
    });
    return unsubscribe;
  }, []);

  // 进度变化后防抖自动推送
  useEffect(() => {
    if (!passphrase || !autoSyncEnabled) return;
    const unsubscribe = usePlayerStore.subscribe(() => {
      // 同步过程中的状态写入（例如拉取覆盖本机）不触发回推
      if (useCloudSyncStore.getState().status === "syncing") return;
      window.clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => {
        void pushNow();
      }, AUTO_PUSH_DEBOUNCE_MS);
    });
    return () => {
      unsubscribe();
      window.clearTimeout(debounceRef.current);
    };
  }, [passphrase, autoSyncEnabled, pushNow]);

  // 离开页面前补推一次，避免防抖窗口内的最后一手改动丢失
  useEffect(() => {
    if (!passphrase || !autoSyncEnabled) return;
    const flush = () => {
      window.clearTimeout(debounceRef.current);
      void pushNow();
    };
    document.addEventListener("visibilitychange", flush);
    window.addEventListener("beforeunload", flush);
    return () => {
      document.removeEventListener("visibilitychange", flush);
      window.removeEventListener("beforeunload", flush);
    };
  }, [passphrase, autoSyncEnabled, pushNow]);
}
