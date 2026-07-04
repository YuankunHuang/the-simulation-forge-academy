import { useState } from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { getWarmupCard } from "@/engine/reviewEngine";
import { WARMUP_GOLD } from "@/engine/rewardEngine";
import { todayStr } from "@/lib/date";
import { selectCompletedIds, usePlayerStore } from "@/store/playerStore";
import type { Quest, ReviewRating } from "@/types/domain";

/** 热身回顾 — 任务开始前的检索练习（学习科学：retrieval practice）。 */
export function WarmupCard({ quest }: { quest: Quest }) {
  const reviewStates = usePlayerStore((s) => s.reviewStates);
  const completedIds = usePlayerStore(selectCompletedIds);
  const warmupClaims = usePlayerStore((s) => s.warmupClaims);
  const claimWarmup = usePlayerStore((s) => s.claimWarmup);

  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);

  const today = todayStr();
  const warmup = getWarmupCard(quest, reviewStates, completedIds, today);
  if (!warmup || done) return null;

  const { card, kind } = warmup;
  const claimedToday = warmupClaims[card.id] === today;
  if (claimedToday) return null;

  const handleRate = (rating: ReviewRating) => {
    claimWarmup(card.id, rating);
    setDone(true);
  };

  return (
    <div className="rounded-2xl border border-skyblue/40 bg-skyblue/5 p-5">
      <p className="flex items-center gap-2 text-xs font-semibold text-skyblue-deep mb-2">
        <Icon name="sparkle" size={14} />
        {kind === "review" ? "热身回顾 · 开工前先唤醒记忆" : "预习提问 · 带着问题去做任务"}
      </p>
      <p className="text-sm font-medium text-ink mb-3">{card.prompt}</p>
      {revealed ? (
        <>
          <p className="text-sm text-ink-soft border-l-2 border-skyblue/50 pl-3 mb-3">{card.answer}</p>
          <div className="flex gap-1.5 flex-wrap items-center">
            <Button size="sm" variant="secondary" onClick={() => handleRate("forgot")}>
              忘了
            </Button>
            <Button size="sm" variant="secondary" onClick={() => handleRate("hard")}>
              有点难
            </Button>
            <Button size="sm" variant="secondary" onClick={() => handleRate("good")}>
              记得
            </Button>
            <Button size="sm" variant="secondary" onClick={() => handleRate("easy")}>
              轻松
            </Button>
            <span className="text-xs text-ink-faint ml-1">+{WARMUP_GOLD} 金币</span>
          </div>
        </>
      ) : (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setRevealed(true)}>
            {kind === "review" ? "显示答案" : "先想 20 秒，再看答案"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setDone(true)}>
            跳过
          </Button>
        </div>
      )}
    </div>
  );
}
