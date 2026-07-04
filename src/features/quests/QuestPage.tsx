import { Fragment, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { REGION_BY_ID } from "@/content/campaigns";
import { QUEST_BY_ID } from "@/content/quests";
import { SKILL_BY_ID } from "@/content/skills";
import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Collapsible } from "@/components/ui/Collapsible";
import { CopyButton } from "@/components/ui/CopyButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { getBossGateChecklist, getQuestStatus } from "@/engine/unlockEngine";
import { formatIsoZh } from "@/lib/date";
import { EVIDENCE_TYPE_LABEL, QUEST_TYPE_LABEL } from "@/lib/formatting";
import { selectCompletedIds, usePlayerStore } from "@/store/playerStore";
import type { Quest } from "@/types/domain";
import { EvidenceForm } from "./EvidenceForm";
import { WarmupCard } from "./WarmupCard";

/**
 * 工坊 / 任务详情 — 一间严肃的工程地下城。
 * 十六段结构（v0.3 规格）：
 * 叙事钩子 → 目标 → 为什么重要 → 概念链 → 产物清单 → 执行计划
 * → 完成定义 → 证据要求 → AI Prompt → 常见陷阱 → 调试笔记
 * → 当前禁止 → 面试讲法 → 展示种子 → 提交证据 → 完成任务。
 * 核心段落常驻展开，参考段落折叠，防止长页疲劳。
 */
export function QuestPage() {
  const { questId } = useParams<{ questId: string }>();
  const completedIds = usePlayerStore(selectCompletedIds);
  const completions = usePlayerStore((s) => s.questCompletions);

  // 工坊流程清单（会话内状态；提交/完成两步自动判定）
  const [readObjective, setReadObjective] = useState(false);
  const [readDoD, setReadDoD] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [workedOutside, setWorkedOutside] = useState(false);
  const [evidenceReady, setEvidenceReady] = useState(false);

  const quest = questId ? QUEST_BY_ID[questId] : undefined;
  if (!quest) {
    return (
      <EmptyState
        icon="fog"
        title="这条路还藏在迷雾里"
        description="没有找到这个任务。回到地图看看当前的路吧。"
        action={
          <Link to="/map">
            <Button variant="secondary">返回地图</Button>
          </Link>
        }
      />
    );
  }

  const region = REGION_BY_ID[quest.regionId];
  const statusInfo = getQuestStatus(quest, completedIds);
  const completion = completions[quest.id];
  const isBoss = quest.type === "boss";
  const isCompleted = statusInfo.status === "completed";
  const isAvailable = statusInfo.status === "available";
  const requiredCount = quest.evidenceRequired.filter((e) => !e.optional).length;

  const checklist: Array<{ label: string; done: boolean; toggle?: () => void }> = [
    { label: "阅读目标", done: readObjective || isCompleted, toggle: () => setReadObjective((v) => !v) },
    { label: "过一遍 DoD", done: readDoD || isCompleted, toggle: () => setReadDoD((v) => !v) },
    { label: "复制 Prompt", done: promptCopied || isCompleted },
    { label: "外部完成工作", done: workedOutside || isCompleted, toggle: () => setWorkedOutside((v) => !v) },
    { label: "提交证据", done: evidenceReady || isCompleted },
    { label: "完成任务", done: isCompleted },
  ];

  return (
    <div className="space-y-4 max-w-3xl">
      {/* ① 叙事钩子 + 头部 */}
      <div>
        <Link to="/map" className="inline-flex items-center gap-1 text-xs text-ink-faint hover:text-ink transition-colors mb-3">
          <Icon name="map" size={13} />
          {region?.name} · 征程地图
        </Link>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge tone={isBoss ? "ember" : "moss"}>{QUEST_TYPE_LABEL[quest.type]}</Badge>
          {quest.optional && <Badge tone="stone">可选支线</Badge>}
          {isCompleted && <Badge tone="moss">已完成</Badge>}
          {statusInfo.status === "locked" && <Badge tone="stone">未解锁</Badge>}
          {quest.estimate && <span className="text-xs text-ink-faint">预计 {quest.estimate}</span>}
        </div>
        <h1 className="text-2xl font-bold text-ink">
          {quest.code} · {quest.title}
        </h1>
        <p className="mt-2 text-sm italic text-wood-dark text-balance">「{quest.narrativeHook}」</p>
      </div>

      {/* 锁定态说明 */}
      {statusInfo.status === "locked" && (
        <Card className="p-5 border-wood-light/40 bg-cream-200/50">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink mb-2">
            <Icon name="lock" size={16} />
            这扇门还没有打开
          </p>
          {statusInfo.regionLocked && <p className="text-sm text-ink-soft mb-1">所在区域尚未解锁——先完成上一区域的 Boss 之门。</p>}
          {statusInfo.missingPrereqIds.length > 0 && (
            <ul className="space-y-1 text-sm text-ink-soft">
              {statusInfo.missingPrereqIds.map((pid) => {
                const pq = QUEST_BY_ID[pid];
                return (
                  <li key={pid} className="flex items-center gap-2">
                    <Icon name="chevron-right" size={13} />
                    先完成：
                    {pq ? (
                      <Link to={`/quests/${pid}`} className="font-medium text-ember-deep hover:underline">
                        {pq.code} · {pq.title}
                      </Link>
                    ) : (
                      pid
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}

      {/* 工坊流程清单（可做/已完成时显示） */}
      {(isAvailable || isCompleted) && (
        <div className="flex flex-wrap items-center gap-x-1 gap-y-2 rounded-2xl border border-wood-light/25 bg-cream-50 px-4 py-3">
          {checklist.map((step, i) => (
            <Fragment key={step.label}>
              {i > 0 && <Icon name="chevron-right" size={11} className="text-wood-light/60 shrink-0" aria-hidden="true" />}
              <button
                type="button"
                onClick={step.toggle}
                disabled={!step.toggle || isCompleted}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  step.done
                    ? "bg-moss/15 text-moss-deep"
                    : step.toggle
                      ? "bg-cream-200/60 text-ink-soft hover:bg-cream-300/60 cursor-pointer"
                      : "bg-cream-200/60 text-ink-faint"
                }`}
                title={step.toggle && !isCompleted ? "点击标记" : undefined}
              >
                <Icon name={step.done ? "check" : "chevron-right"} size={10} />
                {step.label}
              </button>
            </Fragment>
          ))}
        </div>
      )}

      {/* 热身回顾（可做时才显示） */}
      {isAvailable && <WarmupCard quest={quest} />}

      {/* ②③ 目标与意义（常驻） */}
      <Card className="p-5 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-ink mb-1.5 flex items-center gap-2">
            <Icon name="hammer" size={16} className="text-wood" />
            目标
          </h2>
          <p className="text-sm text-ink-soft">{quest.objective}</p>
        </div>
        <div>
          <h2 className="text-sm font-bold text-ink mb-1.5 flex items-center gap-2">
            <Icon name="star" size={16} className="text-wood" />
            为什么重要
          </h2>
          <p className="text-sm text-ink-soft">{quest.whyItMatters}</p>
        </div>
        {/* ④ 概念链 */}
        {quest.conceptMap && quest.conceptMap.length > 0 && (
          <div className="border-t border-wood-light/25 pt-3.5">
            <h2 className="text-xs font-semibold text-ink-faint mb-2">概念链 · Concept Map</h2>
            <div className="flex flex-wrap items-center gap-y-1.5">
              {quest.conceptMap.map((concept, i) => (
                <Fragment key={i}>
                  {i > 0 && <Icon name="chevron-right" size={11} className="mx-1 shrink-0 text-wood-light/70" aria-hidden="true" />}
                  <span className="rounded-lg bg-skyblue/10 border border-skyblue/25 px-2 py-0.5 text-xs text-skyblue-deep">
                    {concept}
                  </span>
                </Fragment>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Boss 之门进度 */}
      {isBoss && (
        <Card className="p-5 border-ember/30">
          <h2 className="text-sm font-bold text-ink mb-3 flex items-center gap-2">
            <Icon name="shield" size={16} className="text-ember-deep" />
            Boss 之门要求
          </h2>
          <ul className="space-y-2">
            {getBossGateChecklist(quest, completedIds).map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${item.met ? "bg-moss/20 text-moss-deep" : "bg-wood/10 text-ink-faint"}`}>
                  <Icon name={item.met ? "check" : "lock"} size={11} />
                </span>
                <span className={item.met ? "text-ink-soft line-through decoration-moss/50" : "text-ink"}>{item.label}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* ⑤ 产物清单 */}
      {quest.filesToCreate && quest.filesToCreate.length > 0 && (
        <Collapsible title="需要创建的文件 / 产物" icon="scroll" defaultOpen={isAvailable}>
          <ul className="space-y-1.5">
            {quest.filesToCreate.map((file, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-ink-soft">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-skyblue" aria-hidden="true" />
                <span className="font-mono text-[13px]">{file}</span>
              </li>
            ))}
          </ul>
        </Collapsible>
      )}

      {/* ⑥ 分步执行计划 */}
      {quest.steps && quest.steps.length > 0 && (
        <Collapsible title="分步执行计划" icon="compass" defaultOpen={isAvailable}>
          <ol className="space-y-2">
            {quest.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-ink-soft">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-wood/10 text-[11px] font-bold text-wood-dark">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </Collapsible>
      )}

      {/* ⑦ 完成定义（常驻） */}
      <Card className="p-5">
        <h2 className="text-sm font-bold text-ink mb-3 flex items-center gap-2">
          <Icon name="check" size={16} className="text-moss-deep" />
          完成的定义（Definition of Done）
        </h2>
        <ul className="space-y-2">
          {quest.definitionOfDone.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-ink-soft">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-moss" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </Card>

      {/* ⑧ 证据要求概览（常驻） */}
      <Card className="p-5">
        <h2 className="text-sm font-bold text-ink mb-1 flex items-center gap-2">
          <Icon name="chest" size={16} className="text-wood" />
          证据要求（{requiredCount} 项必交{quest.evidenceRequired.length > requiredCount ? ` + ${quest.evidenceRequired.length - requiredCount} 项可选` : ""}）
        </h2>
        <p className="text-xs text-ink-faint mb-3">无证据，无精通 XP。做完后回到页面底部提交。</p>
        <ul className="space-y-2">
          {quest.evidenceRequired.map((req) => (
            <li key={req.id} className="flex items-center gap-2.5 text-sm text-ink-soft">
              <Badge tone="stone" className="!text-[10px] shrink-0">
                {EVIDENCE_TYPE_LABEL[req.type]}
              </Badge>
              <span>{req.label}</span>
              {req.optional && <span className="text-xs text-ink-faint">（可选）</span>}
            </li>
          ))}
        </ul>
      </Card>

      {/* ⑨ AI Prompt */}
      <Collapsible
        title="AI Skill / Cursor Prompt"
        icon="sparkle"
        iconClass="text-plum-deep"
        defaultOpen={isAvailable}
        badge={<CopyButton text={quest.aiPrompt} label="复制 Prompt" onCopied={() => setPromptCopied(true)} />}
      >
        <pre className="whitespace-pre-wrap rounded-xl bg-ink/[0.04] border border-wood-light/25 p-4 text-xs leading-relaxed text-ink-soft font-mono scrollbar-thin overflow-x-auto">
          {quest.aiPrompt}
        </pre>
        {quest.resources.length > 0 && (
          <div className="mt-3 border-t border-wood-light/25 pt-3">
            <p className="text-xs font-semibold text-ink-faint mb-1.5">资源建议（只为解锁当前任务）</p>
            <ul className="space-y-1">
              {quest.resources.map((res, i) => (
                <li key={i} className="text-xs">
                  {res.url ? (
                    <a href={res.url} target="_blank" rel="noreferrer" className="font-medium text-skyblue-deep hover:underline">
                      {res.label} ↗
                    </a>
                  ) : (
                    <span className="font-medium text-ink">{res.label}</span>
                  )}
                  {res.note && <span className="ml-2 text-ink-faint">{res.note}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Collapsible>

      {/* ⑩ 常见陷阱 */}
      <Collapsible title="常见陷阱" icon="warning" iconClass="text-ember-deep">
        <ul className="space-y-2">
          {quest.commonTraps.map((trap, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-ink-soft">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-ember" aria-hidden="true" />
              {trap}
            </li>
          ))}
        </ul>
      </Collapsible>

      {/* ⑪ 调试笔记 */}
      {quest.debuggingNotes && quest.debuggingNotes.length > 0 && (
        <Collapsible title="调试笔记 · 卡住时看这里" icon="refresh" iconClass="text-skyblue-deep">
          <ul className="space-y-2">
            {quest.debuggingNotes.map((note, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-ink-soft">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-skyblue" aria-hidden="true" />
                {note}
              </li>
            ))}
          </ul>
        </Collapsible>
      )}

      {/* ⑫ 当前禁止事项（护栏） */}
      {quest.forbiddenForNow && quest.forbiddenForNow.length > 0 && (
        <Collapsible
          title="当前禁止事项 · Forbidden For Now"
          icon="lock"
          iconClass="text-plum-deep"
          badge={<span className="text-[11px] text-ink-faint">{quest.forbiddenForNow.length} 条护栏</span>}
        >
          <p className="text-xs text-ink-faint mb-3">不是永远禁止——只是还不到时候。守住范围，就是守住进度。</p>
          <ul className="space-y-1.5">
            {quest.forbiddenForNow.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink-soft">
                <Icon name="x" size={13} className="mt-0.5 shrink-0 text-plum" />
                {item}
              </li>
            ))}
          </ul>
        </Collapsible>
      )}

      {/* ⑬⑭ 面试讲法 + 展示种子 + 技能 + 下一个风险 */}
      <Collapsible title="面试讲法 · 展示种子 · 下一个风险" icon="quill">
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-ink-faint mb-1.5">完成后，你可以这样向面试官讲</h3>
            <p className="text-sm text-ink-soft italic">“{quest.interviewExplanation}”</p>
          </div>
          {quest.publicShowcaseSeed && (
            <div className="rounded-xl bg-plum/5 border border-plum/20 p-3.5">
              <h3 className="text-xs font-bold text-plum-deep mb-1 flex items-center gap-1.5">
                <Icon name="sparkle" size={12} />
                公开展示种子
              </h3>
              <p className="text-sm text-ink-soft">{quest.publicShowcaseSeed}</p>
            </div>
          )}
          {quest.skills.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-ink-faint mb-2">此任务提供证据的技能</h3>
              <div className="flex flex-wrap gap-1.5">
                {quest.skills.map((sid) => {
                  const skill = SKILL_BY_ID[sid];
                  return skill ? (
                    <Badge key={sid} tone="skyblue">
                      {skill.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}
          <div className="border-t border-wood-light/25 pt-3">
            <p className="text-xs text-wood-dark">
              <span className="font-semibold">下一个风险：</span>
              {quest.nextRisk}
            </p>
          </div>
        </div>
      </Collapsible>

      {/* ⑮⑯ 提交证据 + 完成任务（或已完成回执） */}
      {isCompleted && completion ? (
        <CompletionReceipt quest={quest} completedAt={completion.completedAt} evidence={completion.evidence} />
      ) : (
        isAvailable && (
          <Card elevated className="p-5 !border-ember/40" id="submit">
            <EvidenceForm quest={quest} onValidityChange={setEvidenceReady} />
          </Card>
        )
      )}
    </div>
  );
}

function CompletionReceipt({
  quest,
  completedAt,
  evidence,
}: {
  quest: Quest;
  completedAt: string;
  evidence: Record<string, string>;
}) {
  return (
    <Card className="p-5 border-moss/40 bg-moss/5">
      <h2 className="text-sm font-bold text-ink mb-1 flex items-center gap-2">
        <Icon name="chest" size={16} className="text-moss-deep" />
        已提交的证据
      </h2>
      <p className="text-xs text-ink-faint mb-4">完成于 {formatIsoZh(completedAt)}</p>
      <dl className="space-y-3">
        {quest.evidenceRequired.map((req) => {
          const value = evidence[req.id];
          if (!value?.trim()) return null;
          return (
            <div key={req.id}>
              <dt className="text-xs font-semibold text-ink-soft mb-0.5">{req.label}</dt>
              <dd className="whitespace-pre-wrap rounded-lg bg-white/60 px-3 py-2 text-sm text-ink">{value}</dd>
            </div>
          );
        })}
      </dl>
    </Card>
  );
}
