import { useState } from "react";
import { BONUS_DUNGEONS } from "@/content/bonusDungeons";
import { QUEST_BY_ID } from "@/content/quests";
import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatPill } from "@/components/ui/StatPill";
import { formatNumber } from "@/lib/formatting";
import { selectCompletedIds, usePlayerStore } from "@/store/playerStore";
import type { BonusDungeon } from "@/types/domain";

/**
 * 奖励秘境商店 — 金币购买可选的小型作品集项目。
 * 未达前置的秘境只显示剪影；秘境永不阻塞主线。
 */
export function ShopPage() {
  const gold = usePlayerStore((s) => s.wallet.gold);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink flex items-center gap-2">
            <Icon name="shop" size={22} className="text-wood" />
            奖励秘境商店
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            可选的小冒险：短小、独立、对作品集有用。
          </p>
        </div>
        <StatPill icon="coin" value={gold} label="金币" tone="gold" />
      </header>

      <p className="rounded-xl bg-cream-200/60 border border-wood-light/25 px-4 py-2.5 text-xs text-wood-dark">
        秘境永远不阻塞主线——它们只是学有余力时的奖励副本。
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {BONUS_DUNGEONS.map((dungeon) => (
          <DungeonCard key={dungeon.id} dungeon={dungeon} />
        ))}
      </div>
    </div>
  );
}

function DungeonCard({ dungeon }: { dungeon: BonusDungeon }) {
  const completedIds = usePlayerStore(selectCompletedIds);
  const gold = usePlayerStore((s) => s.wallet.gold);
  const purchased = usePlayerStore((s) => s.purchasedDungeonIds.includes(dungeon.id));
  const completed = usePlayerStore((s) => s.completedDungeonIds.includes(dungeon.id));
  const purchaseDungeon = usePlayerStore((s) => s.purchaseDungeon);
  const completeDungeon = usePlayerStore((s) => s.completeDungeon);

  const [note, setNote] = useState("");
  const unlocked = dungeon.prerequisiteQuestIds.every((q) => completedIds.includes(q));
  const prereqLabels = dungeon.prerequisiteQuestIds.map((id) => QUEST_BY_ID[id]?.code ?? id).join("、");

  // 预告态：前置未达成 — 露出名字与诱惑，但保持锁定
  if (!unlocked) {
    return (
      <Card className="p-5 border-dashed border-wood-light/30 bg-cream-200/40">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-wood/10 text-ink-faint">
              <Icon name="lock" size={18} />
            </span>
            <div>
              <p className="text-sm font-bold text-ink-faint">{dungeon.name}</p>
              <p className="text-[11px] text-ink-faint">{dungeon.nameEn}</p>
            </div>
          </div>
          <Badge tone="stone">
            <Icon name="coin" size={11} />
            {formatNumber(dungeon.costGold)}
          </Badge>
        </div>
        <p className="text-xs text-ink-faint mb-1.5 italic">{dungeon.purpose}</p>
        <p className="text-[11px] text-ink-faint mb-2">
          <span className="font-semibold">作品集价值：</span>
          {dungeon.portfolioValue}
        </p>
        <p className="text-[11px] font-medium text-wood-dark">解锁条件：完成 {prereqLabels}</p>
      </Card>
    );
  }

  return (
    <Card elevated className={`p-5 ${completed ? "border-moss/40" : purchased ? "border-ember/40" : ""}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-plum/10 text-plum-deep">
            <Icon name="sparkle" size={20} />
          </span>
          <div>
            <p className="text-sm font-bold text-ink">{dungeon.name}</p>
            <p className="text-[11px] text-ink-faint">{dungeon.nameEn}</p>
          </div>
        </div>
        {completed ? (
          <Badge tone="moss">已完成</Badge>
        ) : purchased ? (
          <Badge tone="ember">进行中</Badge>
        ) : (
          <Badge tone="wood">
            <Icon name="coin" size={11} />
            {formatNumber(dungeon.costGold)}
          </Badge>
        )}
      </div>

      <p className="text-sm text-ink-soft mb-1.5">{dungeon.purpose}</p>
      <p className="text-xs text-ink-faint mb-3">
        <span className="font-semibold">作品集价值：</span>
        {dungeon.portfolioValue}
      </p>

      {purchased ? (
        <div className="space-y-3">
          <div className="rounded-xl bg-cream-200/60 p-3.5">
            <p className="text-xs font-bold text-ink-soft mb-2">范围简报（守住时间盒，别让甜点变主食）</p>
            <ul className="space-y-1">
              {dungeon.scope.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-ink-soft">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-plum" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-ink-soft">
              <span className="font-semibold">交付物：</span>
              {dungeon.deliverable}
            </p>
          </div>
          {!completed && (
            <div className="space-y-2">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="完成记录（至少 10 字）：做了什么，交付物在哪里"
                className="w-full rounded-xl border border-wood-light/40 bg-white/70 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint/70 focus:border-ember resize-none"
              />
              <Button
                className="w-full"
                disabled={note.trim().length < 10}
                onClick={() => completeDungeon(dungeon.id, note)}
              >
                提交完成记录（+{dungeon.completionRewards.xp} XP · +{dungeon.completionRewards.reputation} 声望）
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Button
          className="w-full"
          variant="secondary"
          disabled={gold < dungeon.costGold}
          onClick={() => purchaseDungeon(dungeon.id)}
        >
          <Icon name="coin" size={15} />
          {gold >= dungeon.costGold ? `开启秘境（${formatNumber(dungeon.costGold)} 金币）` : `金币不足（需要 ${formatNumber(dungeon.costGold)}）`}
        </Button>
      )}
    </Card>
  );
}
