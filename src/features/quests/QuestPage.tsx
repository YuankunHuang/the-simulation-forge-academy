import { AnimatePresence, motion } from "framer-motion";
import { Fragment, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { QUEST_BY_ID } from "@/content/quests";
import { SKILL_BY_ID } from "@/content/skills";
import { Icon, type IconName } from "@/components/icons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { assembleDefenseText } from "@/engine/evidenceEngine";
import { getBossGateChecklist, getQuestStatus } from "@/engine/unlockEngine";
import { formatIsoZh } from "@/lib/date";
import { EVIDENCE_TYPE_LABEL, QUEST_TYPE_LABEL } from "@/lib/formatting";
import { SPRING_BOUNCY, sheetVariants, slideVariants } from "@/lib/motion";
import { selectCompletedIds, usePlayerStore } from "@/store/playerStore";
import type { Quest } from "@/types/domain";
import { BossDefenseForm } from "./BossDefenseForm";
import { EvidenceForm } from "./EvidenceForm";
import { WarmupCard } from "./WarmupCard";

/**
 * 工坊 / 任务详情 — Duolingo 课程式全屏闯关流程。
 * 一屏只看一步：① 任务简报 → ② 作战计划 → ③ 装备领取 → ④ 提交证据。
 * 参考资料（陷阱 / 调试 / 面试讲法 / 护栏）收进右下角「锦囊」抽屉。
 */

const STEPS: Array<{ id: string; label: string; icon: IconName }> = [
  { id: "brief", label: "简报", icon: "scroll" },
  { id: "plan", label: "计划", icon: "compass" },
  { id: "gear", label: "装备", icon: "sparkle" },
  { id: "submit", label: "证据", icon: "chest" },
];

export function QuestPage() {
  const { questId } = useParams<{ questId: string }>();
  const navigate = useNavigate();
  const completedIds = usePlayerStore(selectCompletedIds);
  const completions = usePlayerStore((s) => s.questCompletions);

  const [[step, direction], setStep] = useState<[number, number]>([0, 0]);
  const [pouchOpen, setPouchOpen] = useState(false);

  const quest = questId ? QUEST_BY_ID[questId] : undefined;
  if (!quest) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <EmptyState
          icon="fog"
          title="这条路还藏在迷雾里"
          description="没有找到这个任务。回到路径看看当前的路吧。"
          action={
            <Link to="/">
              <Button variant="secondary">返回路径</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const statusInfo = getQuestStatus(quest, completedIds);
  const completion = completions[quest.id];
  const isCompleted = statusInfo.status === "completed";
  const isLocked = statusInfo.status === "locked";

  const goTo = (next: number) => setStep(([cur]) => [next, next > cur ? 1 : -1]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶栏：退出 + 分段进度 + 锦囊 */}
      <header className="sticky top-0 z-30 border-b border-wood-light/20 bg-cream-100/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            aria-label="退出工坊"
            className="shrink-0 rounded-xl p-1.5 text-ink-faint transition-colors hover:bg-wood/10 hover:text-ink"
          >
            <Icon name="x" size={20} />
          </button>

          {isCompleted || isLocked ? (
            <p className="flex-1 truncate text-sm font-bold text-ink text-center">
              {quest.code} · {quest.title}
            </p>
          ) : (
            <div className="flex flex-1 items-center gap-1.5" aria-label={`第 ${step + 1} 步，共 ${STEPS.length} 步`}>
              {STEPS.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => i <= step && goTo(i)}
                  disabled={i > step}
                  aria-label={s.label}
                  className={`h-2.5 flex-1 rounded-full transition-colors duration-300 ${
                    i < step ? "bg-ember" : i === step ? "bg-ember/90" : "bg-wood/15"
                  } ${i <= step ? "cursor-pointer" : ""}`}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setPouchOpen(true)}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-wood-light/40 bg-cream-50 px-2.5 py-1.5 text-xs font-semibold text-wood-dark transition-colors hover:bg-cream-200"
          >
            <Icon name="book" size={15} />
            锦囊
          </button>
        </div>
      </header>

      {/* 主体 */}
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-6">
          {isLocked ? (
            <LockedScreen quest={quest} missingPrereqIds={statusInfo.missingPrereqIds} regionLocked={statusInfo.regionLocked} />
          ) : isCompleted && completion ? (
            <CompletedScreen quest={quest} completedAt={completion.completedAt} evidence={completion.evidence} />
          ) : (
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="initial"
                animate="enter"
                exit="exit"
              >
                {step === 0 && <BriefStep quest={quest} />}
                {step === 1 && <PlanStep quest={quest} completedIds={completedIds} />}
                {step === 2 && <GearStep quest={quest} />}
                {step === 3 && <SubmitStep quest={quest} />}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* 底部操作条（sticky：路由过渡的 transform 不会破坏定位） */}
      <footer className="sticky bottom-0 z-30 border-t border-wood-light/20 bg-cream-50/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          {isLocked || isCompleted ? (
            <Button size="lg" className="w-full" variant={isCompleted ? "secondary" : "primary"} onClick={() => navigate("/")}>
              <Icon name="map" size={18} />
              回到路径
            </Button>
          ) : (
            <>
              {step > 0 && (
                <Button variant="ghost" size="lg" onClick={() => goTo(step - 1)}>
                  上一步
                </Button>
              )}
              {step < STEPS.length - 1 ? (
                <Button size="lg" className="flex-1" onClick={() => goTo(step + 1)}>
                  继续
                  <Icon name="chevron-right" size={17} />
                </Button>
              ) : (
                <p className="flex-1 text-center text-xs text-ink-faint">
                  完成上方证据提交，任务即告完成。无证据，无精通 XP。
                </p>
              )}
            </>
          )}
        </div>
      </footer>

      {/* 锦囊抽屉 */}
      <PouchDrawer quest={quest} open={pouchOpen} onClose={() => setPouchOpen(false)} />
    </div>
  );
}

/* ---------------- 步骤 ① 任务简报 ---------------- */

function BriefStep({ quest }: { quest: Quest }) {
  const isBoss = quest.type === "boss";
  return (
    <div className="space-y-4">
      <div className="text-center pt-2">
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={SPRING_BOUNCY}
          className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
            isBoss ? "bg-ember/15 text-ember-deep" : "bg-wood/10 text-wood-dark"
          }`}
        >
          <Icon name={isBoss ? "shield" : "hammer"} size={30} />
        </motion.span>
        <div className="mb-2 flex flex-wrap items-center justify-center gap-2">
          <Badge tone={isBoss ? "ember" : "moss"}>{QUEST_TYPE_LABEL[quest.type]}</Badge>
          {quest.optional && <Badge tone="stone">可选支线</Badge>}
          {quest.estimate && <span className="text-xs text-ink-faint">预计 {quest.estimate}</span>}
        </div>
        <h1 className="text-2xl font-bold text-ink">
          {quest.code} · {quest.title}
        </h1>
        <p className="mt-3 text-sm italic text-wood-dark text-balance">「{quest.narrativeHook}」</p>
      </div>

      <Card className="p-5">
        <h2 className="mb-1.5 flex items-center gap-2 text-sm font-bold text-ink">
          <Icon name="hammer" size={16} className="text-wood" />
          目标
        </h2>
        <p className="text-sm text-ink-soft">{quest.objective}</p>
      </Card>

      <Card className="p-5">
        <h2 className="mb-1.5 flex items-center gap-2 text-sm font-bold text-ink">
          <Icon name="star" size={16} className="text-wood" />
          为什么重要
        </h2>
        <p className="text-sm text-ink-soft">{quest.whyItMatters}</p>
      </Card>

      {quest.conceptMap && quest.conceptMap.length > 0 && (
        <Card className="p-5">
          <h2 className="mb-2 text-xs font-semibold text-ink-faint">概念链 · Concept Map</h2>
          <div className="flex flex-wrap items-center gap-y-1.5">
            {quest.conceptMap.map((concept, i) => (
              <Fragment key={i}>
                {i > 0 && (
                  <Icon name="chevron-right" size={11} className="mx-1 shrink-0 text-wood-light/70" aria-hidden="true" />
                )}
                <span className="rounded-lg border border-skyblue/25 bg-skyblue/10 px-2 py-0.5 text-xs text-skyblue-deep">
                  {concept}
                </span>
              </Fragment>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ---------------- 步骤 ② 作战计划 ---------------- */

function CheckItem({
  index,
  label,
  mono = false,
}: {
  index?: number;
  label: string;
  mono?: boolean;
}) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setDone((d) => !d)}
      aria-pressed={done}
      className="flex w-full items-start gap-2.5 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-cream-200/50"
    >
      <motion.span
        animate={done ? { scale: [1, 1.35, 1] } : {}}
        transition={{ duration: 0.3 }}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
          done ? "bg-moss text-white" : "bg-wood/10 text-wood-dark"
        }`}
      >
        {done ? <Icon name="check" size={11} /> : (index ?? "·")}
      </motion.span>
      <span
        className={`text-sm transition-colors ${mono ? "font-mono text-[13px]" : ""} ${
          done ? "text-ink-faint line-through decoration-moss/50" : "text-ink-soft"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

function PlanStep({ quest, completedIds }: { quest: Quest; completedIds: string[] }) {
  const isBoss = quest.type === "boss";
  return (
    <div className="space-y-4">
      <StepHeading icon="compass" title="作战计划" sub="做的时候逐条勾掉——勾选只在本次会话里，是给手感用的。" />

      {isBoss && (
        <Card className="border-ember/30 p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
            <Icon name="shield" size={16} className="text-ember-deep" />
            Boss 之门要求
          </h2>
          <ul className="space-y-2">
            {getBossGateChecklist(quest, completedIds).map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                    item.met ? "bg-moss/20 text-moss-deep" : "bg-wood/10 text-ink-faint"
                  }`}
                >
                  <Icon name={item.met ? "check" : "lock"} size={11} />
                </span>
                <span className={item.met ? "text-ink-soft line-through decoration-moss/50" : "text-ink"}>{item.label}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {quest.steps && quest.steps.length > 0 && (
        <Card className="p-4">
          <h2 className="mb-2 px-2 flex items-center gap-2 text-sm font-bold text-ink">
            <Icon name="compass" size={16} className="text-wood" />
            分步执行
          </h2>
          <div className="space-y-0.5">
            {quest.steps.map((s, i) => (
              <CheckItem key={i} index={i + 1} label={s} />
            ))}
          </div>
        </Card>
      )}

      {quest.filesToCreate && quest.filesToCreate.length > 0 && (
        <Card className="p-4">
          <h2 className="mb-2 px-2 flex items-center gap-2 text-sm font-bold text-ink">
            <Icon name="scroll" size={16} className="text-skyblue-deep" />
            需要创建的文件 / 产物
          </h2>
          <div className="space-y-0.5">
            {quest.filesToCreate.map((f, i) => (
              <CheckItem key={i} label={f} mono />
            ))}
          </div>
        </Card>
      )}

      <Card className="p-4">
        <h2 className="mb-2 px-2 flex items-center gap-2 text-sm font-bold text-ink">
          <Icon name="check" size={16} className="text-moss-deep" />
          完成的定义（Definition of Done）
        </h2>
        <div className="space-y-0.5">
          {quest.definitionOfDone.map((d, i) => (
            <CheckItem key={i} label={d} />
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ---------------- 步骤 ③ 装备领取 ---------------- */

function GearStep({ quest }: { quest: Quest }) {
  return (
    <div className="space-y-4">
      <StepHeading icon="sparkle" title="装备领取" sub="热身唤醒记忆，复制 Prompt 出发。工作在学院之外完成。" />

      <WarmupCard quest={quest} />

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
            <Icon name="sparkle" size={16} className="text-plum-deep" />
            AI Skill / Cursor Prompt
          </h2>
          <CopyButton text={quest.aiPrompt} label="复制 Prompt" />
        </div>
        <pre className="max-h-[40vh] overflow-auto whitespace-pre-wrap rounded-xl border border-wood-light/25 bg-ink/[0.04] p-4 font-mono text-xs leading-relaxed text-ink-soft scrollbar-thin">
          {quest.aiPrompt}
        </pre>
      </Card>

      {quest.resources.length > 0 && (
        <Card className="p-5">
          <h2 className="mb-2 text-xs font-semibold text-ink-faint">资源建议（只为解锁当前任务）</h2>
          <ul className="space-y-1.5">
            {quest.resources.map((res, i) => (
              <li key={i} className="text-sm">
                {res.url ? (
                  <a href={res.url} target="_blank" rel="noreferrer" className="font-medium text-skyblue-deep hover:underline">
                    {res.label} ↗
                  </a>
                ) : (
                  <span className="font-medium text-ink">{res.label}</span>
                )}
                {res.note && <span className="ml-2 text-xs text-ink-faint">{res.note}</span>}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

/* ---------------- 步骤 ④ 提交证据 ---------------- */

function SubmitStep({ quest }: { quest: Quest }) {
  const isBoss = quest.type === "boss";
  const requiredCount = quest.evidenceRequired.filter((e) => !e.optional).length;
  return (
    <div className="space-y-4">
      <StepHeading
        icon="chest"
        title={isBoss ? "Boss 答辩" : "提交证据"}
        sub={`${requiredCount} 项必交${quest.evidenceRequired.length > requiredCount ? ` + ${quest.evidenceRequired.length - requiredCount} 项可选` : ""} · 无证据，无精通 XP。`}
      />
      <Card elevated className="!border-ember/40 p-5">
        {isBoss ? <BossDefenseForm quest={quest} /> : <EvidenceForm quest={quest} />}
      </Card>
    </div>
  );
}

function StepHeading({ icon, title, sub }: { icon: IconName; title: string; sub: string }) {
  return (
    <div className="text-center">
      <h1 className="flex items-center justify-center gap-2 text-lg font-bold text-ink">
        <Icon name={icon} size={20} className="text-wood" />
        {title}
      </h1>
      <p className="mt-1 text-xs text-ink-faint text-balance">{sub}</p>
    </div>
  );
}

/* ---------------- 锁定 / 已完成 单屏 ---------------- */

function LockedScreen({
  quest,
  missingPrereqIds,
  regionLocked,
}: {
  quest: Quest;
  missingPrereqIds: string[];
  regionLocked: boolean;
}) {
  return (
    <div className="pt-8 text-center">
      <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cream-300 text-stone2">
        <Icon name="lock" size={28} />
      </span>
      <h1 className="text-xl font-bold text-ink">这扇门还没有打开</h1>
      <p className="mt-2 text-sm text-ink-soft">
        {quest.code} · {quest.title}
      </p>
      <Card className="mx-auto mt-6 max-w-md p-5 text-left">
        {regionLocked && <p className="mb-2 text-sm text-ink-soft">所在区域尚未解锁——先完成上一区域的 Boss 之门。</p>}
        {missingPrereqIds.length > 0 && (
          <ul className="space-y-1.5 text-sm text-ink-soft">
            {missingPrereqIds.map((pid) => {
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
    </div>
  );
}

function CompletedScreen({
  quest,
  completedAt,
  evidence,
}: {
  quest: Quest;
  completedAt: string;
  evidence: Record<string, string>;
}) {
  const isBoss = quest.type === "boss";
  return (
    <div className="space-y-4">
      <div className="pt-4 text-center">
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={SPRING_BOUNCY}
          className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-moss/15 text-moss-deep"
        >
          <Icon name="check" size={30} />
        </motion.span>
        <h1 className="text-xl font-bold text-ink">
          {quest.code} · {quest.title}
        </h1>
        <p className="mt-1 text-xs text-ink-faint">
          完成于 {formatIsoZh(completedAt)}
          {isBoss && " · 答辩全文也在篝火日志（面试防线）里"}
        </p>
      </div>

      <Card className="border-moss/40 bg-moss/5 p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
            <Icon name="chest" size={16} className="text-moss-deep" />
            {isBoss ? "答辩存档" : "已提交的证据"}
          </h2>
          {isBoss && <CopyButton text={assembleDefenseText(quest, evidence)} label="复制完整答辩" />}
        </div>
        <dl className="space-y-3">
          {quest.evidenceRequired.map((req) => {
            const value = evidence[req.id];
            if (!value?.trim()) return null;
            return (
              <div key={req.id}>
                <dt className="mb-0.5 text-xs font-semibold text-ink-soft">
                  {req.label}
                  <span className="ml-2 font-normal text-ink-faint">{EVIDENCE_TYPE_LABEL[req.type]}</span>
                </dt>
                <dd className="whitespace-pre-wrap rounded-lg bg-white/60 px-3 py-2 text-sm text-ink">{value}</dd>
              </div>
            );
          })}
        </dl>
      </Card>
    </div>
  );
}

/* ---------------- 锦囊抽屉 ---------------- */

function PouchSection({
  icon,
  iconClass,
  title,
  children,
}: {
  icon: IconName;
  iconClass: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className={`mb-2 flex items-center gap-2 text-sm font-bold text-ink`}>
        <Icon name={icon} size={15} className={iconClass} />
        {title}
      </h3>
      {children}
    </section>
  );
}

function PouchDrawer({ quest, open, onClose }: { quest: Quest; open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="锦囊 · 参考资料"
            variants={sheetVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            className="absolute bottom-0 inset-x-0 mx-auto max-h-[82vh] w-full max-w-2xl overflow-y-auto scrollbar-thin rounded-t-3xl border border-b-0 border-wood-light/30 bg-cream-50 px-5 pb-8 pt-3 shadow-card"
          >
            <div className="sticky top-0 -mx-5 mb-4 bg-cream-50 px-5 pb-2 pt-1">
              <span className="mx-auto mb-3 block h-1.5 w-12 rounded-full bg-wood/20" aria-hidden="true" />
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-bold text-ink">
                  <Icon name="book" size={18} className="text-wood" />
                  锦囊 · 卡住时看这里
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="关闭锦囊"
                  className="rounded-lg p-1.5 text-ink-faint transition-colors hover:bg-wood/10 hover:text-ink"
                >
                  <Icon name="x" size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <PouchSection icon="warning" iconClass="text-ember-deep" title="常见陷阱">
                <ul className="space-y-2">
                  {quest.commonTraps.map((trap, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-ink-soft">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-ember" aria-hidden="true" />
                      {trap}
                    </li>
                  ))}
                </ul>
              </PouchSection>

              {quest.debuggingNotes && quest.debuggingNotes.length > 0 && (
                <PouchSection icon="refresh" iconClass="text-skyblue-deep" title="调试笔记">
                  <ul className="space-y-2">
                    {quest.debuggingNotes.map((note, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-ink-soft">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-skyblue" aria-hidden="true" />
                        {note}
                      </li>
                    ))}
                  </ul>
                </PouchSection>
              )}

              {quest.forbiddenForNow && quest.forbiddenForNow.length > 0 && (
                <PouchSection icon="lock" iconClass="text-plum-deep" title="当前禁止事项">
                  <p className="mb-2 text-xs text-ink-faint">不是永远禁止——只是还不到时候。守住范围，就是守住进度。</p>
                  <ul className="space-y-1.5">
                    {quest.forbiddenForNow.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-ink-soft">
                        <Icon name="x" size={13} className="mt-0.5 shrink-0 text-plum" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </PouchSection>
              )}

              <PouchSection icon="quill" iconClass="text-wood" title="面试讲法">
                <p className="text-sm italic text-ink-soft">“{quest.interviewExplanation}”</p>
              </PouchSection>

              {quest.publicShowcaseSeed && (
                <PouchSection icon="sparkle" iconClass="text-plum-deep" title="公开展示种子">
                  <p className="rounded-xl border border-plum/20 bg-plum/5 p-3.5 text-sm text-ink-soft">
                    {quest.publicShowcaseSeed}
                  </p>
                </PouchSection>
              )}

              {quest.skills.length > 0 && (
                <PouchSection icon="skilltree" iconClass="text-skyblue-deep" title="此任务提供证据的技能">
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
                </PouchSection>
              )}

              <p className="border-t border-wood-light/25 pt-3 text-xs text-wood-dark">
                <span className="font-semibold">下一个风险：</span>
                {quest.nextRisk}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
