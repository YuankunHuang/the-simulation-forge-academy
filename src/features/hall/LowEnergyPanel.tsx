import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getDueCards } from "@/engine/reviewEngine";
import { LOW_ENERGY_GOLD } from "@/engine/rewardEngine";
import { todayStr } from "@/lib/date";
import { selectCompletedIds, usePlayerStore } from "@/store/playerStore";
import type { ReviewRating } from "@/types/domain";

/**
 * 低能量套餐：1 张复习卡 + 一句小反思 + 读一眼当前任务。
 * 小额金币奖励，无精通 XP，每天一次，绝不制造压力。
 */
export function LowEnergyPanel({ questId }: { questId?: string }) {
  const reviewStates = usePlayerStore((s) => s.reviewStates);
  const completedIds = usePlayerStore(selectCompletedIds);
  const lowEnergyDoneDate = usePlayerStore((s) => s.lowEnergyDoneDate);
  const rateReviewCard = usePlayerStore((s) => s.rateReviewCard);
  const completeCheckin = usePlayerStore((s) => s.completeLowEnergyCheckin);

  const [reflection, setReflection] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [cardRated, setCardRated] = useState(false);

  const today = todayStr();
  const doneToday = lowEnergyDoneDate === today;
  const dueCards = getDueCards(reviewStates, completedIds, today);
  const card = dueCards[0] ?? null;

  const handleRate = (rating: ReviewRating) => {
    if (card) rateReviewCard(card.id, rating);
    setCardRated(true);
  };

  if (doneToday) {
    return (
      <Card className="p-5 border-moss/40 bg-moss/5">
        <div className="flex items-center gap-3">
          <Icon name="check" size={22} className="text-moss-deep" />
          <div>
            <p className="text-sm font-semibold text-ink">今日的低能量套餐已完成</p>
            <p className="text-xs text-ink-soft">火没有熄，这就够了。好好休息，明天见。</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 space-y-4">
      <div>
        <p className="text-sm font-bold text-ink mb-1">低能量套餐</p>
        <p className="text-xs text-ink-soft">三件小事，让火不灭：翻一张卡 → 写一句话 → 读一眼任务。</p>
      </div>

      {/* 第 1 步：复习卡 */}
      <div className="rounded-xl bg-cream-200/60 p-4">
        <p className="text-xs font-semibold text-ink-faint mb-2">① 翻一张复习卡</p>
        {card && !cardRated ? (
          <>
            <p className="text-sm font-medium text-ink mb-2">{card.prompt}</p>
            {revealed ? (
              <>
                <p className="text-sm text-ink-soft border-l-2 border-ember/50 pl-3 mb-3">{card.answer}</p>
                <div className="flex gap-1.5 flex-wrap">
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
                </div>
              </>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => setRevealed(true)}>
                显示答案
              </Button>
            )}
          </>
        ) : (
          <p className="text-sm text-ink-soft">
            {cardRated ? "完成！轻轻的一次回忆也是锻炼。" : "今天没有到期的卡片——这一步免费通过。"}
          </p>
        )}
      </div>

      {/* 第 2 步：小反思 */}
      <div className="rounded-xl bg-cream-200/60 p-4">
        <p className="text-xs font-semibold text-ink-faint mb-2">② 写一句今天的想法（可以很短）</p>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          rows={2}
          placeholder="例如：今天很累，但我还记得 extern C 是干嘛的。"
          className="w-full rounded-xl border border-wood-light/40 bg-white/70 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint/70 focus:border-ember resize-none"
        />
      </div>

      {/* 第 3 步：读一眼任务 + 完成 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {questId && (
          <Link
            to={`/quests/${questId}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-wood-light/40 bg-cream-50 px-4 py-2 text-sm font-medium text-ink-soft hover:bg-cream-200 transition-colors"
          >
            <Icon name="scroll" size={15} />
            ③ 读一眼当前任务
          </Link>
        )}
        <Button className="flex-1" onClick={() => completeCheckin(reflection)}>
          完成今日签到（+{LOW_ENERGY_GOLD} 金币）
        </Button>
      </div>
    </Card>
  );
}
