import { motion } from "framer-motion";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { useCloudSyncStore } from "@/store/cloudSyncStore";

/**
 * GateScreen — 应用入口的口令门（个人门户）。
 * 没有口令时替代整个路由树；口令即云端存档的钥匙：
 * 验证通过后持久化到本机（sfa-cloud-sync-v1），以后打开直接进入并自动同步最新存档。
 */
export function GateScreen() {
  const connect = useCloudSyncStore((s) => s.connect);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleUnlock = async () => {
    const passphrase = input.trim();
    if (!passphrase || busy) return;
    setBusy(true);
    setError(null);
    const result = await connect(passphrase);
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? "解锁失败，请稍后再试。");
    }
    // 成功后 App 会因 passphrase 变化自动切入主界面，无需在这里做任何跳转
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="w-full max-w-sm"
      >
        <div className="rounded-3xl bg-cream-50 border border-wood-light/30 shadow-card p-8 space-y-6">
          <div className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-ember/15 flex items-center justify-center">
              <Icon name="flame" size={34} className="text-ember animate-flicker" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-ink">仿真铸造学院</h1>
              <p className="mt-1 text-sm text-ink-soft">输入口令，唤醒你的冒险进度</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Icon
                name="lock"
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
              />
              <input
                type="password"
                autoFocus
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && void handleUnlock()}
                placeholder="同步口令"
                aria-label="同步口令"
                className="w-full rounded-xl border border-wood-light/40 bg-white/70 pl-10 pr-3.5 py-3 text-sm text-ink placeholder:text-ink-faint/70 focus:border-ember"
              />
            </div>

            <Button size="lg" className="w-full" disabled={busy || !input.trim()} onClick={handleUnlock}>
              {busy ? (
                <>
                  <Icon name="refresh" size={17} className="animate-spin" />
                  验证中…
                </>
              ) : (
                <>
                  <Icon name="sparkle" size={17} />
                  进入学院
                </>
              )}
            </Button>

            {error && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700"
              >
                {error}
              </p>
            )}
          </div>

          <p className="text-center text-xs text-ink-faint leading-relaxed">
            这把钥匙同时也是云端存档的口令——
            <br />
            解锁后会自动接上你在任何设备上的最新进度。
          </p>
        </div>
      </motion.div>
    </div>
  );
}
