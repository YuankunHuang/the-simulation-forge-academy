import { Link, useParams } from "react-router-dom";
import { REGION_BY_ID } from "@/content/campaigns";
import { QUEST_BY_ID } from "@/content/quests";
import { SKILL_BY_ID } from "@/content/skills";
import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { getBossGateChecklist, getQuestStatus } from "@/engine/unlockEngine";
import { formatIsoZh } from "@/lib/date";
import { EVIDENCE_TYPE_LABEL, QUEST_TYPE_LABEL } from "@/lib/formatting";
import { selectCompletedIds, usePlayerStore } from "@/store/playerStore";
import { EvidenceForm } from "./EvidenceForm";
import { WarmupCard } from "./WarmupCard";

/**
 * 工坊 / 任务详情 — 像走进一间地下城工坊。
 * 段落顺序（v0.2 规格）：
 * 叙事钩子 → 目标 → 为什么重要 → DoD → 证据要求 → AI Prompt
 * → 常见陷阱 → 当前禁止事项 → 面试讲法 → 提交证据 → 完成任务
 */
export function QuestPage() {
  const { questId } = useParams<{ questId: string }>();
  const completedIds = usePlayerStore(selectCompletedIds);
  const completions = usePlayerStore((s) => s.questCompletions);

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
  const requiredCount = quest.evidenceRequired.filter((e) => !e.optional).length;

  return (
    <div className="space-y-5 max-w-3xl">
      {/* ① 叙事钩子 + 头部 */}
      <div>
        <Link to="/map" className="inline-flex items-center gap-1 text-xs text-ink-faint hover:text-ink transition-colors mb-3">
          <Icon name="map" size={13} />
          {region?.name} · 征程地图
        </Link>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge tone={isBoss ? "ember" : "moss"}>{QUEST_TYPE_LABEL[quest.type]}</Badge>
          {quest.optional && <Badge tone="stone">可选支线</Badge>}
          {statusInfo.status === "completed" && <Badge tone="moss">已完成</Badge>}
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

      {/* 热身回顾（可做时才显示） */}
      {statusInfo.status === "available" && <WarmupCard quest={quest} />}

      {/* ②③ 目标与意义 */}
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

      {/* ④ 完成定义 */}
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

      {/* ⑤ 证据要求概览 */}
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

      {/* ⑥ AI Prompt */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-ink flex items-center gap-2">
            <Icon name="sparkle" size={16} className="text-plum-deep" />
            AI Skill / Cursor Prompt
          </h2>
          <CopyButton text={quest.aiPrompt} label="复制 Prompt" />
        </div>
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
      </Card>

      {/* ⑦ 常见陷阱 */}
      <Card className="p-5">
        <h2 className="text-sm font-bold text-ink mb-3 flex items-center gap-2">
          <Icon name="warning" size={16} className="text-ember-deep" />
          常见陷阱
        </h2>
        <ul className="space-y-2">
          {quest.commonTraps.map((trap, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-ink-soft">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-ember" aria-hidden="true" />
              {trap}
            </li>
          ))}
        </ul>
      </Card>

      {/* ⑧ 当前禁止事项（护栏） */}
      {quest.forbiddenForNow && quest.forbiddenForNow.length > 0 && (
        <Card className="p-5 border-plum/30 bg-plum/5">
          <h2 className="text-sm font-bold text-plum-deep mb-3 flex items-center gap-2">
            <Icon name="lock" size={16} />
            当前禁止事项 · Forbidden For Now
          </h2>
          <p className="text-xs text-ink-faint mb-3">不是永远禁止——只是还不到时候。守住范围，就是守住进度。</p>
          <ul className="space-y-1.5">
            {quest.forbiddenForNow.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink-soft">
                <Icon name="x" size={13} className="mt-0.5 shrink-0 text-plum" />
                {item}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* ⑨ 面试讲法 + 技能 + 下一个风险 */}
      <Card className="p-5 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-ink mb-1.5 flex items-center gap-2">
            <Icon name="quill" size={16} className="text-wood" />
            完成后，你可以这样向面试官讲
          </h2>
          <p className="text-sm text-ink-soft italic">“{quest.interviewExplanation}”</p>
        </div>
        {quest.skills.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-ink-faint mb-2">此任务提供证据的技能</h2>
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
      </Card>

      {/* ⑩⑪ 提交证据 + 完成任务（或已完成回执） */}
      {statusInfo.status === "completed" && completion ? (
        <Card className="p-5 border-moss/40 bg-moss/5">
          <h2 className="text-sm font-bold text-ink mb-1 flex items-center gap-2">
            <Icon name="chest" size={16} className="text-moss-deep" />
            已提交的证据
          </h2>
          <p className="text-xs text-ink-faint mb-4">完成于 {formatIsoZh(completion.completedAt)}</p>
          <dl className="space-y-3">
            {quest.evidenceRequired.map((req) => {
              const value = completion.evidence[req.id];
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
      ) : (
        statusInfo.status === "available" && (
          <Card elevated className="p-5 !border-ember/40" id="submit">
            <EvidenceForm quest={quest} />
          </Card>
        )
      )}
    </div>
  );
}
