import { useState } from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { formatIsoZh } from "@/lib/date";
import type { RemoteSummary } from "@/lib/saveSummary";
import { useCloudSyncStore } from "@/store/cloudSyncStore";

/**
 * 云端存档面板 — 接入现有存档页签。
 * 口令的输入与验证由入口门户（GateScreen）负责，这里只展示同步状态与手动兜底操作。
 */
export function CloudSyncPanel() {
  const passphrase = useCloudSyncStore((s) => s.passphrase);
  const autoSyncEnabled = useCloudSyncStore((s) => s.autoSyncEnabled);
  const lastSyncedAt = useCloudSyncStore((s) => s.lastSyncedAt);
  const status = useCloudSyncStore((s) => s.status);
  const disconnect = useCloudSyncStore((s) => s.disconnect);
  const setAutoSync = useCloudSyncStore((s) => s.setAutoSync);
  const pushNow = useCloudSyncStore((s) => s.pushNow);
  const pullNow = useCloudSyncStore((s) => s.pullNow);
  const peekRemote = useCloudSyncStore((s) => s.peekRemote);

  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [pullConfirm, setPullConfirm] = useState<{ summary: RemoteSummary | null } | null>(null);
  const [busy, setBusy] = useState(false);

  const handlePushNow = async () => {
    setBusy(true);
    const result = await pushNow();
    setBusy(false);
    setMessage(
      result.ok
        ? { tone: "ok", text: "已上传到云端。" }
        : { tone: "error", text: result.error ?? "上传失败。" },
    );
  };

  const handleOpenPullConfirm = async () => {
    setBusy(true);
    const peek = await peekRemote();
    setBusy(false);
    if (!peek.ok) {
      setMessage({ tone: "error", text: peek.error ?? "连接云端失败。" });
      return;
    }
    setPullConfirm({ summary: peek.summary ?? null });
  };

  const handleConfirmPull = async () => {
    setBusy(true);
    const result = await pullNow();
    setBusy(false);
    setPullConfirm(null);
    setMessage(
      result.ok
        ? { tone: "ok", text: "已用云端存档覆盖本机，欢迎回来。" }
        : { tone: "error", text: result.error ?? "拉取失败。" },
    );
  };

  return (
    <Card className="p-5 space-y-4">
      <div>
        <h2 className="text-sm font-bold text-ink mb-1 flex items-center gap-2">
          <Icon name="cards" size={16} className="text-skyblue-deep" />
          云端存档同步
        </h2>
        <p className="text-xs text-ink-soft">
          跨设备共享进度：本机改动会自动同步到云端，其它设备打开时也会自动加载最新进度。
        </p>
      </div>

      {passphrase && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-cream-200/60 px-4 py-2.5">
            <span className="flex items-center gap-1.5 text-xs text-ink-soft">
              <Icon name={status === "error" ? "warning" : "check"} size={13} className={status === "error" ? "text-ember-deep" : "text-moss-deep"} />
              {lastSyncedAt ? `上次同步：${formatIsoZh(lastSyncedAt)}` : "还未同步过"}
            </span>
            <button
              type="button"
              onClick={() => setAutoSync(!autoSyncEnabled)}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                autoSyncEnabled ? "bg-moss/15 text-moss-deep" : "bg-wood/10 text-ink-faint"
              }`}
            >
              自动同步：{autoSyncEnabled ? "已开启" : "已关闭"}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="secondary" className="flex-1" disabled={busy} onClick={handlePushNow}>
              <Icon name="upload" size={16} />
              立即同步到云端
            </Button>
            <Button variant="secondary" className="flex-1" disabled={busy} onClick={handleOpenPullConfirm}>
              <Icon name="download" size={16} />
              从云端拉取到本机
            </Button>
          </div>
          <button type="button" onClick={disconnect} className="text-xs text-ink-faint hover:text-ink transition-colors">
            退出并锁上大门（口令只会从本机清除，云端存档保留）
          </button>
        </>
      )}

      {message && (
        <p
          role="status"
          className={`rounded-xl px-4 py-2.5 text-sm ${
            message.tone === "ok"
              ? "bg-moss/10 border border-moss/30 text-moss-deep"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {message.text}
        </p>
      )}

      <Modal open={!!pullConfirm} onClose={() => setPullConfirm(null)} title="确认用云端存档覆盖本机？">
        {pullConfirm && (
          <div className="space-y-3">
            {pullConfirm.summary ? (
              <div className="rounded-xl bg-cream-200/60 p-4 text-sm text-ink-soft space-y-1">
                <p>
                  <span className="font-semibold text-ink">云端等级：</span>Lv.{pullConfirm.summary.level}
                </p>
                <p>
                  <span className="font-semibold text-ink">云端已完成任务：</span>
                  {pullConfirm.summary.completedCount} 个
                </p>
                {pullConfirm.summary.exportedAt && (
                  <p>
                    <span className="font-semibold text-ink">云端存档时间：</span>
                    {formatIsoZh(pullConfirm.summary.exportedAt)}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-ink-soft">云端目前还没有存档，拉取不会有任何效果。</p>
            )}
            <p className="text-xs text-ink-faint">这会用以上云端内容完全覆盖本机当前进度，本机未同步的改动会丢失。</p>
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setPullConfirm(null)}>
                取消
              </Button>
              <Button variant="danger" className="flex-1" disabled={busy} onClick={handleConfirmPull}>
                确认覆盖本机
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
}
