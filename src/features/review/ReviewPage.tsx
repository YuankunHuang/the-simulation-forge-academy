import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { QUEST_BY_ID } from "@/content/quests";
import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getDueCards, getUpcomingCount } from "@/engine/reviewEngine";
import { REVIEW_GOLD } from "@/engine/rewardEngine";
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
        <EmptyState
          icon="cards"
          title="今天没有到期的卡片"
          description={
            completedIds.length <= 1
              ? "完成任务后，相关的知识卡会进入卡组，按记忆曲线回来找你。先去做今天的任务吧。"
              : upcoming > 0
                ? `有 ${upcoming} 张卡在未来几天等着回来。今天可以安心做主线。`
                : "完成更多任务来收集新的知识卡。"
          }
          action={
            <Link to="/">
              <Button variant="secondary">回炉火大厅</Button>
            </Link>
          }
        />
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
