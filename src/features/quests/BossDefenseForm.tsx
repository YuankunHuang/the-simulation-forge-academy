import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  defenseDrillPrompt,
  isEvidenceFieldValid,
  validateEvidence,
} from "@/engine/evidenceEngine";
import { usePlayerStore } from "@/store/playerStore";
import type { Quest } from "@/types/domain";

/**
 * Boss 答辩表单 — 逐题引导的面试式答辩：
 * 每题一张问题卡（编号 + 演练 Prompt + 作答区 + 完成态勾选），
 * 顶部进度条实时反映已答题数；全部必答完成后才能开门。
 */
export function BossDefenseForm({
  quest,
  onValidityChange,
}: {
  quest: Quest;
  onValidityChange?: (valid: boolean) => void;
}) {
  const completeQuest = usePlayerStore((s) => s.completeQuest);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validation = validateEvidence(quest, fields);

  useEffect(() => {
    onValidityChange?.(validation.ok);
  }, [validation.ok, onValidityChange]);

  const required = useMemo(() => quest.evidenceRequired.filter((r) => !r.optional), [quest]);
  const optional = useMemo(() => quest.evidenceRequired.filter((r) => r.optional), [quest]);
  const answeredCount = required.filter((r) => isEvidenceFieldValid(r, fields[r.id]) && (fields[r.id] ?? "").trim()).length;

  const handleChange = (id: string, value: string) => {
    setFields((prev) => ({ ...prev, [id]: value }));
    setTouched((prev) => ({ ...prev, [id]: true }));
  };

  const handleSubmit = () => {
    if (!validation.ok) return;
    completeQuest(quest.id, fields);
  };

  return (
    <div className="space-y-4">
      {/* 答辩进度 */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-sm font-bold text-ink flex items-center gap-2">
            <Icon name="shield" size={16} className="text-ember-deep" />
            Boss 答辩 · 共 {required.length} 题
          </h3>
          <span className="text-xs text-ink-faint">
            已答 {answeredCount} / {required.length}
          </span>
        </div>
        <ProgressBar value={answeredCount} max={required.length} tone="ember" label="答辩进度" />
        <p className="mt-1.5 text-xs text-ink-faint">
          每题可先复制演练 Prompt 与 AI 对练，再把打磨后的回答写进作答区。答辩全文会存入篝火日志作为面试防线。
        </p>
      </div>

      {/* 必答题卡 */}
      {required.map((req, i) => {
        const value = fields[req.id] ?? "";
        const answered = !!value.trim() && isEvidenceFieldValid(req, value);
        const invalid = touched[req.id] && !isEvidenceFieldValid(req, value);
        return (
          <div
            key={req.id}
            className={`rounded-2xl border p-4 transition-colors ${
              answered ? "border-moss/40 bg-moss/5" : invalid ? "border-ember/50 bg-cream-50" : "border-wood-light/30 bg-cream-50"
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2.5">
              <div className="flex items-start gap-2.5 min-w-0">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    answered ? "bg-moss/20 text-moss-deep" : "bg-ember/12 text-ember-deep"
                  }`}
                >
                  {answered ? <Icon name="check" size={13} /> : i + 1}
                </span>
                <label htmlFor={`${quest.id}_${req.id}`} className="text-sm font-semibold text-ink pt-0.5">
                  {req.label}
                </label>
              </div>
              <CopyButton text={defenseDrillPrompt(quest, req)} label="演练 Prompt" />
            </div>
            <textarea
              id={`${quest.id}_${req.id}`}
              value={value}
              onChange={(e) => handleChange(req.id, e.target.value)}
              placeholder={req.placeholder}
              rows={4}
              className={`w-full rounded-xl border bg-white/70 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint/70 transition-colors focus:border-ember focus:bg-white resize-y min-h-[96px] scrollbar-thin ${
                invalid ? "border-ember/60" : "border-wood-light/40"
              }`}
            />
            {value.trim() && (
              <p className="mt-1 text-right text-[11px] text-ink-faint">{value.trim().length} 字</p>
            )}
          </div>
        );
      })}

      {/* 可选题（如面试防线草稿） */}
      {optional.map((req) => {
        const value = fields[req.id] ?? "";
        return (
          <div key={req.id} className="rounded-2xl border border-dashed border-wood-light/40 bg-cream-50 p-4">
            <div className="flex items-start justify-between gap-2 mb-2.5">
              <label htmlFor={`${quest.id}_${req.id}`} className="text-sm font-medium text-ink-soft">
                {req.label}
                <span className="ml-2 text-xs font-normal text-ink-faint">（可选）</span>
              </label>
              <CopyButton text={defenseDrillPrompt(quest, req)} label="演练 Prompt" />
            </div>
            <textarea
              id={`${quest.id}_${req.id}`}
              value={value}
              onChange={(e) => handleChange(req.id, e.target.value)}
              placeholder={req.placeholder}
              rows={3}
              className="w-full rounded-xl border border-wood-light/40 bg-white/70 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint/70 transition-colors focus:border-ember focus:bg-white resize-y min-h-[72px] scrollbar-thin"
            />
          </div>
        );
      })}

      {/* 开门 */}
      <div className="pt-1">
        <Button size="lg" className="w-full" disabled={!validation.ok} onClick={handleSubmit}>
          <Icon name="shield" size={18} />
          {validation.ok ? "提交答辩，开启之门" : `还差 ${validation.missing.length} 题必答`}
        </Button>
        {!validation.ok && (
          <p className="mt-2 text-xs text-ink-faint text-center">未完成：{validation.missing.join("、")}</p>
        )}
      </div>
    </div>
  );
}
