import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { QUEST_BY_ID } from "@/content/quests";
import { SKILL_BY_ID } from "@/content/skills";
import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getRecommendedQuest } from "@/engine/questEngine";
import { getDueCards, getUpcomingCardInfo, getUpcomingCount } from "@/engine/reviewEngine";
import { REVIEW_GOLD } from "@/engine/rewardEngine";
import { WarmupCard } from "@/features/quests/WarmupCard";
import { todayStr } from "@/lib/date";
import { selectCompletedIds, usePlayerStore } from "@/store/playerStore";
import type { ReviewRating } from "@/types/domain";

/** 复习卡组 — 简化间隔重复：到期卡 → 先想 → 翻面 → 评分。 */
export function ReviewPage() {
  const reviewStates = usePlayerStore((s) => s.reviewStates);
  const completedIds = usePlayerStore(selectCompletedIds);
  const rateReviewCard = usePlayerStore((s) => s.rateReviewCard);

  const today = todayStr();
  // 会话开始时固定卡片队列，评分后逐张前进
  const sessionCards = useMemo(() => getDueCards(reviewStates, completedIds, today), []);  // eslint-disable-line react-hooks/exhaustive-deps
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [ratedCount, setRatedCount] = useState(0);

  const upcoming = getUpcomingCount(reviewStates, completedIds, today);
  const card = sessionCards[index];
  const sessionDone = sessionCards.length > 0 && index >= sessionCards.length;

  const handleRate = (rating: ReviewRating) => {
    if (!card) return;
    rateReviewCard(card.id, rating);
    setRatedCount((c) => c + 1);
    setRevealed(false);
    setIndex((i) => i + 1);
  };

  if (sessionCards.length === 0) {
    return (
      <div className="space-y-5">
        <ReviewHeader due={0} />
        <ReviewEmptyState upcoming={upcoming} completedIds={completedIds} />
      </div>
    );
  }

  if (sessionDone) {
    return (
      <div className="space-y-5">
        <ReviewHeader due={0} />
        <Card elevated className="p-8 text-center">
          <Icon name="sparkle" size={36} className="mx-auto mb-3 text-ember" />
          <h2 className="text-lg font-bold text-ink mb-1">今日复习完成</h2>
          <p className="text-sm text-ink-soft mb-4">
            复习了 {ratedCount} 张卡片，+{ratedCount * REVIEW_GOLD} 金币。记忆的火花已经重新点亮。
          </p>
          <Link to="/">
            <Button>回炉火大厅</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const quest = card ? QUEST_BY_ID[card.questId] : undefined;

  return (
    <div className="space-y-5">
      <ReviewHeader due={sessionCards.length - index} />
      <div className="max-w-xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <ProgressBar value={index} max={sessionCards.length} tone="skyblue" className="flex-1" label="复习进度" />
          <span className="text-xs text-ink-faint whitespace-nowrap">
            {index + 1} / {sessionCards.length}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={card.id}
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -32 }}
            transition={{ duration: 0.22 }}
          >
            <Card elevated className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <Badge tone="skyblue">问题</Badge>
                {quest && <span className="text-xs text-ink-faint">来自 {quest.code} · {quest.title}</span>}
              </div>
              <p className="text-lg font-semibold text-ink leading-relaxed mb-6 text-balance">{card.prompt}</p>

              {revealed ? (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="rounded-xl bg-cream-200/70 border-l-4 border-ember p-4 mb-6">
                    <p className="text-sm text-ink leading-relaxed">{card.answer}</p>
                  </div>
                  <p className="text-xs text-ink-faint mb-2 text-center">你刚才想起来了吗？</p>
                  <div className="grid grid-cols-4 gap-2">
                    <Button variant="secondary" onClick={() => handleRate("forgot")} className="!border-red-200 !text-red-700 hover:!bg-red-50">
                      忘了
                    </Button>
                    <Button variant="secondary" onClick={() => handleRate("hard")} className="!border-ember/40 !text-ember-deep">
                      有点难
                    </Button>
                    <Button variant="secondary" onClick={() => handleRate("good")} className="!border-moss/40 !text-moss-deep">
                      记得
                    </Button>
                    <Button variant="secondary" onClick={() => handleRate("easy")} className="!border-skyblue/40 !text-skyblue-deep">
                      轻松
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <Button size="lg" className="w-full" onClick={() => setRevealed(true)}>
                  先努力回忆，再显示答案
                </Button>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function ReviewHeader({ due }: { due: number }) {
  return (
    <header>
      <h1 className="text-xl font-bold text-ink flex items-center gap-2">
        <Icon name="cards" size={22} className="text-wood" />
        复习卡组
      </h1>
      <p className="text-sm text-ink-soft mt-1">
        {due > 0 ? `还有 ${due} 张卡片等着你。先回忆，再翻面——挣扎本身就是记忆的锻造。` : "间隔重复让知识在将忘未忘时回来。"}
      </p>
    </header>
  );
}

/**
 * 空状态 v0.2 — 主动引导而非被动安慰：
 * 解释卡从哪来、下一批卡在哪个任务里、并在合适时提供一张可选预习卡。
 */
function ReviewEmptyState({ upcoming, completedIds }: { upcoming: number; completedIds: string[] }) {
  const upcomingInfo = getUpcomingCardInfo(completedIds);
  const recommended = getRecommendedQuest(completedIds);

  // 只有当推荐任务本身带卡时，才提供预习热身（不造假到期卡）
  const showWarmup = !!recommended && upcomingInfo?.quest.id === recommended.id;

  const topics = upcomingInfo
    ? [
        ...new Set(
          upcomingInfo.quest.skills
            .map((sid) => SKILL_BY_ID[sid]?.name)
            .filter((n): n is string => !!n),
        ),
      ].slice(0, 5)
    : [];

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <Card className="p-6 text-center">
        <Icon name="cards" size={30} className="mx-auto mb-3 text-wood" />
        <h2 className="text-base font-semibold text-ink mb-1.5">今天没有到期的卡片</h2>
        <p className="text-sm text-ink-soft text-balance">
          {upcoming > 0
            ? `有 ${upcoming} 张卡在未来几天按记忆曲线回来。今天可以安心做主线。`
            : "知识卡不是凭空出现的——每完成一个任务，你亲手用过的概念才会进入卡组。"}
        </p>
        {upcomingInfo && (
          <div className="mt-4 rounded-xl bg-cream-200/60 p-4 text-left">
            <p className="text-xs font-semibold text-ink-soft mb-1">下一批知识卡藏在</p>
            <p className="text-sm font-bold text-ink">
              {upcomingInfo.quest.code} · {upcomingInfo.quest.title}
              <span className="ml-2 text-xs font-normal text-ink-faint">{upcomingInfo.cards.length} 张卡</span>
            </p>
            {topics.length > 0 && (
              <p className="mt-1.5 text-xs text-ink-soft">
                完成后入组：{topics.join("、")}
              </p>
            )}
            <Link to={`/quests/${upcomingInfo.quest.id}`} className="inline-block mt-3">
              <Button size="sm">
                去做这个任务
                <Icon name="chevron-right" size={14} />
              </Button>
            </Link>
          </div>
        )}
        {!upcomingInfo && (
          <Link to="/" className="inline-block mt-4">
            <Button variant="secondary">回炉火大厅</Button>
          </Link>
        )}
      </Card>

      {/* 可选预习：推荐任务自带的卡（学前检索，不算复习） */}
      {showWarmup && recommended && (
        <div>
          <p className="text-xs text-ink-faint mb-2 text-center">或者，先带着问题出发——</p>
          <WarmupCard quest={recommended} />
        </div>
      )}
    </div>
  );
}
