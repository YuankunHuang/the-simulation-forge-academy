import { useState } from "react";
import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { isEvidenceFieldValid, validateEvidence } from "@/engine/evidenceEngine";
import { EVIDENCE_TYPE_LABEL } from "@/lib/formatting";
import { usePlayerStore } from "@/store/playerStore";
import type { Quest } from "@/types/domain";

/**
 * 证据提交表单 — 核心规则的执行处：必填证据齐全前，完成按钮保持禁用。
 */
export function EvidenceForm({ quest }: { quest: Quest }) {
  const completeQuest = usePlayerStore((s) => s.completeQuest);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validation = validateEvidence(quest, fields);

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
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-bold text-ink">提交证据</h3>
        <span className="text-xs text-ink-faint">无证据，无精通 XP</span>
      </div>
      {quest.evidenceRequired.map((req) => {
        const value = fields[req.id] ?? "";
        const valid = !touched[req.id] || isEvidenceFieldValid(req, value);
        return (
          <div key={req.id} className="space-y-1">
            <Field
              id={`${quest.id}_${req.id}`}
              label={req.label}
              value={value}
              onChange={(v) => handleChange(req.id, v)}
              placeholder={req.placeholder}
              multiline={req.multiline}
              optional={req.optional}
              valid={valid}
              hint={
                req.type === "commit_hash"
                  ? "至少 6 个字符；本地提交可写缩写 hash"
                  : undefined
              }
            />
            <Badge tone="stone" className="!text-[10px]">
              {EVIDENCE_TYPE_LABEL[req.type]}
            </Badge>
          </div>
        );
      })}
      <div className="pt-1">
        <Button size="lg" className="w-full" disabled={!validation.ok} onClick={handleSubmit}>
          <Icon name="check" size={18} />
          {validation.ok ? "提交证据，完成任务" : `还差 ${validation.missing.length} 项必填证据`}
        </Button>
        {!validation.ok && (
          <p className="mt-2 text-xs text-ink-faint text-center">缺少：{validation.missing.join("、")}</p>
        )}
      </div>
    </div>
  );
}
