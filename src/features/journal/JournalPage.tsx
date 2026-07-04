import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { QUEST_BY_ID } from "@/content/quests";
import { ARTIFACTS, ARTIFACT_BY_ID } from "@/content/artifacts";
import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { showcasePromptsFor } from "@/engine/evidenceEngine";
import { formatDateZh, formatIsoZh } from "@/lib/date";
import { selectCompletedIds, usePlayerStore } from "@/store/playerStore";
import { SaveDataPanel } from "./SaveDataPanel";

type Tab = "history" | "reflections" | "recaps" | "showcase" | "save";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "history", label: "冒险日志" },
  { id: "reflections", label: "反思" },
  { id: "recaps", label: "冲刺回顾" },
  { id: "showcase", label: "展示草稿" },
  { id: "save", label: "存档" },
];

const KIND_LABEL: Record<string, string> = {
  reflection: "任务反思",
  low_energy: "低能量签到",
  note: "随笔",
  dungeon: "秘境记录",
  boss_defense: "Boss 答辩",
  showcase: "展示种子",
};

/** 篝火日志 — 历史、反思、冲刺回顾与存档管理。 */
export function JournalPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) || "history";
  const [tab, setTab] = useState<Tab>(TABS.some((t) => t.id === initialTab) ? initialTab : "history");

  const completions = usePlayerStore((s) => s.questCompletions);
  const journal = usePlayerStore((s) => s.journal);
  const recaps = usePlayerStore((s) => s.recaps);
  const completedIds = usePlayerStore(selectCompletedIds);

  const history = useMemo(
    () => Object.values(completions).sort((a, b) => b.completedAt.localeCompare(a.completedAt)),
    [completions],
  );

  const switchTab = (t: Tab) => {
    setTab(t);
    setSearchParams(t === "history" ? {} : { tab: t }, { replace: true });
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold text-ink flex items-center gap-2">
          <Icon name="book" size={22} className="text-wood" />
          篝火日志
        </h1>
        <p className="text-sm text-ink-soft mt-1">火堆旁的记录：走过的路、想过的事、冲刺过的夜晚。</p>
      </header>

      {/* 标签页 */}
      <div className="flex gap-1.5 flex-wrap" role="tablist" aria-label="日志分类">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => switchTab(t.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t.id ? "bg-ember text-white shadow-soft" : "bg-cream-200/70 text-ink-soft hover:bg-cream-300/70"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 冒险日志：完成的任务 */}
      {tab === "history" &&
        (history.length === 0 ? (
          <EmptyState icon="scroll" title="旅程还未记下第一笔" description="完成第一个任务后，它会出现在这里。" />
        ) : (
          <div className="space-y-3">
            {history.map((c) => {
              const quest = QUEST_BY_ID[c.questId];
              if (!quest) return null;
              return (
                <Card key={c.questId} className="p-4 flex items-start gap-3">
                  <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${quest.type === "boss" ? "bg-ember/15 text-ember-deep" : "bg-moss/15 text-moss-deep"}`}>
                    <Icon name={quest.type === "boss" ? "shield" : "check"} size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-ink">
                        {quest.code} · {quest.title}
                      </p>
                      {quest.artifactIds.map((aid) => {
                        const artifact = ARTIFACT_BY_ID[aid];
                        return artifact ? (
                          <Badge key={aid} tone="plum">
                            <Icon name="trophy" size={11} />
                            {artifact.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                    <p className="text-xs text-ink-faint mt-0.5">{formatIsoZh(c.completedAt)}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        ))}

      {/* 反思（含 Boss 答辩 / 面试防线） */}
      {tab === "reflections" &&
        (journal.length === 0 ? (
          <EmptyState icon="quill" title="还没有反思记录" description="任务完成时的反思、Boss 答辩全文、低能量签到的一句话，都会留在这里。" />
        ) : (
          <div className="space-y-3">
            {journal.map((entry) => {
              const quest = entry.questId ? QUEST_BY_ID[entry.questId] : undefined;
              return (
                <Card key={entry.id} className={`p-4 ${entry.kind === "boss_defense" ? "border-ember/35" : ""}`}>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <Badge
                      tone={
                        entry.kind === "low_energy"
                          ? "skyblue"
                          : entry.kind === "dungeon"
                            ? "plum"
                            : entry.kind === "boss_defense"
                              ? "ember"
                              : "moss"
                      }
                    >
                      {entry.kind === "boss_defense" && <Icon name="shield" size={11} />}
                      {KIND_LABEL[entry.kind] ?? entry.kind}
                    </Badge>
                    {quest && <span className="text-xs text-ink-faint">{quest.code} · {quest.title}</span>}
                    <span className="text-xs text-ink-faint ml-auto">{formatDateZh(entry.date)}</span>
                  </div>
                  <p className="text-sm text-ink whitespace-pre-wrap">{entry.text}</p>
                </Card>
              );
            })}
          </div>
        ))}

      {/* 展示草稿：已解锁神器的公开展示素材 */}
      {tab === "showcase" && <ShowcaseTab completedIds={completedIds} />}

      {/* 冲刺回顾 */}
      {tab === "recaps" &&
        (recaps.length === 0 ? (
          <EmptyState
            icon="flame"
            title="还没有冲刺回顾"
            description="在炉火大厅选择『深度冲刺』模式，连续完成任务后结束冲刺，回顾会出现在这里。"
          />
        ) : (
          <div className="space-y-4">
            {recaps.map((recap) => (
              <Card key={recap.id} elevated className="p-5">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <p className="text-sm font-bold text-ink flex items-center gap-2">
                    <Icon name="flame" size={16} className="text-ember" />
                    冲刺回顾
                  </p>
                  <span className="text-xs text-ink-faint">
                    {formatIsoZh(recap.startedAt)} — {formatIsoZh(recap.endedAt)}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-center">
                  <div className="rounded-lg bg-cream-200/60 py-2">
                    <p className="text-lg font-bold text-ink">{recap.questIds.length}</p>
                    <p className="text-[11px] text-ink-faint">完成任务</p>
                  </div>
                  <div className="rounded-lg bg-cream-200/60 py-2">
                    <p className="text-lg font-bold text-ink">{recap.artifactIds.length}</p>
                    <p className="text-[11px] text-ink-faint">神器入库</p>
                  </div>
                  <div className="rounded-lg bg-cream-200/60 py-2">
                    <p className="text-lg font-bold text-plum-deep">{recap.totals.xp}</p>
                    <p className="text-[11px] text-ink-faint">XP</p>
                  </div>
                  <div className="rounded-lg bg-cream-200/60 py-2">
                    <p className="text-lg font-bold text-ember-deep">{recap.totals.gold}</p>
                    <p className="text-[11px] text-ink-faint">金币</p>
                  </div>
                </div>
                <div className="space-y-1.5 mb-3">
                  {recap.questIds.map((qid) => {
                    const q = QUEST_BY_ID[qid];
                    return q ? (
                      <p key={qid} className="flex items-center gap-2 text-sm text-ink-soft">
                        <Icon name="check" size={13} className="text-moss-deep" />
                        {q.code} · {q.title}
                      </p>
                    ) : null;
                  })}
                </div>
                {((recap.skillIdsAvailable?.length ?? 0) > 0 || (recap.reviewCardIds?.length ?? 0) > 0) && (
                  <p className="mb-3 text-xs text-ink-soft">
                    {(recap.skillIdsAvailable?.length ?? 0) > 0 && (
                      <span className="mr-3">技能证据就绪 {recap.skillIdsAvailable.length} 项</span>
                    )}
                    {(recap.reviewCardIds?.length ?? 0) > 0 && <span>复习卡入组 {recap.reviewCardIds.length} 张</span>}
                  </p>
                )}
                {recap.showcaseSuggestions.length > 0 && (
                  <div className="rounded-xl bg-plum/5 border border-plum/20 p-3.5 mb-3">
                    <p className="text-xs font-bold text-plum-deep mb-1.5">公开展示建议</p>
                    {recap.showcaseSuggestions.map((s, i) => (
                      <p key={i} className="text-xs text-ink-soft mb-1">
                        {s}
                      </p>
                    ))}
                  </div>
                )}
                {recap.nextRisk && (
                  <p className="text-xs text-wood-dark">
                    <span className="font-semibold">下一个风险：</span>
                    {recap.nextRisk}
                  </p>
                )}
                {recap.nextQuestId && QUEST_BY_ID[recap.nextQuestId] && (
                  <p className="text-xs text-ink-soft mt-1">
                    <span className="font-semibold">下次建议：</span>
                    {QUEST_BY_ID[recap.nextQuestId].code} · {QUEST_BY_ID[recap.nextQuestId].title}
                  </p>
                )}
              </Card>
            ))}
          </div>
        ))}

      {/* 存档 */}
      {tab === "save" && <SaveDataPanel completedCount={completedIds.length} />}
    </div>
  );
}

/**
 * 展示草稿页签 — 把已解锁神器的公开展示素材汇成一处：
 * 简历要点直接复制；LinkedIn/博客复制的是完整起草 Prompt。
 */
function ShowcaseTab({ completedIds }: { completedIds: string[] }) {
  const unlocked = ARTIFACTS.filter((a) => completedIds.includes(a.sourceQuestId));

  if (unlocked.length === 0) {
    return (
      <EmptyState
        icon="sparkle"
        title="还没有可展示的素材"
        description="每件铸成的神器都会在这里留下 LinkedIn / 博客 / 简历素材。先去完成第一个任务。"
        action={
          <Link to="/">
            <Button variant="secondary">去接今日任务</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-faint">
        学院不会自动发布任何内容。以下素材随神器解锁自动生成：简历要点可直接粘贴，LinkedIn / 博客按钮复制的是交给 AI 的起草 Prompt。
      </p>
      {unlocked.map((artifact) => {
        const prompts = showcasePromptsFor(artifact);
        const quest = QUEST_BY_ID[artifact.sourceQuestId];
        return (
          <Card key={artifact.id} className="p-5">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Icon name="trophy" size={16} className="text-wood" />
              <p className="text-sm font-bold text-ink">{artifact.name}</p>
              {quest && <span className="text-xs text-ink-faint">来源：{quest.code}</span>}
            </div>
            <div className="space-y-2.5">
              <ShowcaseRow label="简历要点" body={artifact.resumeBullet} copyText={prompts.resume} copyLabel="复制" />
              <ShowcaseRow label="LinkedIn 建议" body={artifact.linkedinSuggestion} copyText={prompts.linkedin} copyLabel="复制起草 Prompt" />
              <ShowcaseRow label="博客建议" body={artifact.blogSuggestion} copyText={prompts.blog} copyLabel="复制起草 Prompt" />
              <ShowcaseRow label="作品集文案" body={artifact.portfolioSuggestion} copyText={prompts.portfolio} copyLabel="复制" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function ShowcaseRow({
  label,
  body,
  copyText,
  copyLabel,
}: {
  label: string;
  body: string;
  copyText: string;
  copyLabel: string;
}) {
  return (
    <div className="rounded-xl bg-cream-200/50 p-3.5">
      <div className="flex items-center justify-between gap-2 mb-1">
        <p className="text-[11px] font-bold text-ink-soft">{label}</p>
        <CopyButton text={copyText} label={copyLabel} />
      </div>
      <p className="text-xs text-ink whitespace-pre-wrap">{body}</p>
    </div>
  );
}

