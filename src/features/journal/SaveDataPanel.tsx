import { useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { todayStr } from "@/lib/date";
import { usePlayerStore } from "@/store/playerStore";

/** 存档面板 — 导出/导入 JSON 与重置。数据只属于你，只存在你的浏览器里。 */
export function SaveDataPanel({ completedCount }: { completedCount: number }) {
  const exportSave = usePlayerStore((s) => s.exportSave);
  const importSave = usePlayerStore((s) => s.importSave);
  const resetAll = usePlayerStore((s) => s.resetAll);

  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleExport = () => {
    const json = exportSave();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `forge-academy-save-${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ tone: "ok", text: "存档已导出为 JSON 文件。" });
  };

  const handleImportFile = async (file: File) => {
    const text = await file.text();
    const result = importSave(text);
    setMessage(
      result.ok
        ? { tone: "ok", text: "存档导入成功，欢迎回来。" }
        : { tone: "error", text: result.error ?? "导入失败。" },
    );
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    resetAll();
    setConfirmReset(false);
    setMessage({ tone: "ok", text: "已重置。炉火重新点燃，新的旅程开始了。" });
  };

  return (
    <div className="space-y-4 max-w-xl">
      <Card className="p-5 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-ink mb-1">存档管理</h2>
          <p className="text-xs text-ink-soft">
            所有数据只保存在你自己的浏览器（localStorage）里，没有云端、没有账号。当前进度：已完成 {completedCount} 个任务。
            建议定期导出 JSON 备份。
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="secondary" className="flex-1" onClick={handleExport}>
            <Icon name="download" size={16} />
            导出存档 JSON
          </Button>
          <Button variant="secondary" className="flex-1" onClick={() => fileRef.current?.click()}>
            <Icon name="upload" size={16} />
            导入存档 JSON
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleImportFile(file);
              e.target.value = "";
            }}
          />
        </div>
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
      </Card>

      <Card className="p-5 border-red-200/60">
        <h2 className="text-sm font-bold text-ink mb-1">危险区域</h2>
        <p className="text-xs text-ink-soft mb-3">重置会清空全部进度、证据与存档。此操作不可撤销——请先导出备份。</p>
        <div className="flex items-center gap-2">
          <Button variant="danger" onClick={handleReset}>
            {confirmReset ? "确认重置一切？（再点一次生效）" : "重置全部进度"}
          </Button>
          {confirmReset && (
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>
              取消
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
