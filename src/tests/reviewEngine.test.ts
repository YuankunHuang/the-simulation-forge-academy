import { describe, expect, it } from "vitest";
import { QUEST_BY_ID } from "@/content/quests";
import {
  DEFAULT_EASE,
  MIN_EASE,
  cardsUnlockedBy,
  getDueCards,
  getUpcomingCardInfo,
  getWarmupCard,
  initialCardState,
  rateCard,
} from "@/engine/reviewEngine";
import type { ReviewCardState } from "@/types/domain";

const TODAY = "2026-07-03";

describe("reviewEngine · 评分与间隔", () => {
  it("新卡初始状态：今天到期，间隔 0", () => {
    const s = initialCardState("card_extern_c", TODAY);
    expect(s.nextReviewDate).toBe(TODAY);
    expect(s.intervalDays).toBe(0);
    expect(s.ease).toBe(DEFAULT_EASE);
  });

  it("『记得』：新卡 → 1 天后；老卡按 ease 倍增", () => {
    const fresh = rateCard(initialCardState("c", TODAY), "good", TODAY);
    expect(fresh.intervalDays).toBe(1);
    expect(fresh.nextReviewDate).toBe("2026-07-04");

    const mature: ReviewCardState = { ...fresh, intervalDays: 4 };
    const next = rateCard(mature, "good", TODAY);
    expect(next.intervalDays).toBe(Math.round(4 * DEFAULT_EASE));
  });

  it("『忘了』：间隔清零、当天重来、ease 下降、lapses+1", () => {
    const mature: ReviewCardState = { ...initialCardState("c", TODAY), intervalDays: 10, reps: 3 };
    const s = rateCard(mature, "forgot", TODAY);
    expect(s.intervalDays).toBe(0);
    expect(s.nextReviewDate).toBe(TODAY);
    expect(s.reps).toBe(0);
    expect(s.lapses).toBe(1);
    expect(s.ease).toBeCloseTo(DEFAULT_EASE - 0.2);
  });

  it("『有点难』增长慢于『记得』，『轻松』增长最快且提升 ease", () => {
    const base: ReviewCardState = { ...initialCardState("c", TODAY), intervalDays: 5 };
    const hard = rateCard(base, "hard", TODAY);
    const good = rateCard(base, "good", TODAY);
    const easy = rateCard(base, "easy", TODAY);
    expect(hard.intervalDays).toBeLessThan(good.intervalDays);
    expect(good.intervalDays).toBeLessThan(easy.intervalDays);
    expect(easy.ease).toBeGreaterThan(DEFAULT_EASE);
  });

  it("ease 不会低于下限", () => {
    let s = initialCardState("c", TODAY);
    for (let i = 0; i < 20; i++) s = rateCard(s, "forgot", TODAY);
    expect(s.ease).toBeGreaterThanOrEqual(MIN_EASE);
  });
});

describe("reviewEngine · 到期卡与卡组准入", () => {
  it("未完成任务的卡不入组", () => {
    expect(getDueCards({}, [], TODAY)).toHaveLength(0);
  });

  it("完成 M2 后，M2 的卡片作为新卡到期", () => {
    const due = getDueCards({}, ["q_r0", "m0", "m1", "m2"], TODAY);
    const ids = due.map((c) => c.id);
    expect(ids).toContain("card_extern_c");
    expect(ids).toContain("card_entrypoint");
    expect(ids).not.toContain("card_blittable"); // m4 未完成
  });

  it("未到期的卡不出现", () => {
    const states = {
      card_extern_c: { ...initialCardState("card_extern_c", TODAY), nextReviewDate: "2026-07-10" },
    };
    const due = getDueCards(states, ["q_r0", "m0", "m1", "m2"], TODAY);
    expect(due.map((c) => c.id)).not.toContain("card_extern_c");
  });
});

describe("reviewEngine · 卡片来源引导（v0.2）", () => {
  it("cardsUnlockedBy 返回任务关联的全部卡", () => {
    const m2Cards = cardsUnlockedBy("m2").map((c) => c.id);
    expect(m2Cards).toContain("card_extern_c");
    expect(m2Cards).toContain("card_entrypoint");
    expect(cardsUnlockedBy("m0")).toHaveLength(0);
  });

  it("新玩家的下一批卡指向 R0（世界顺序上第一个带卡的未完成任务）", () => {
    const info = getUpcomingCardInfo([]);
    expect(info).not.toBeNull();
    expect(info!.quest.id).toBe("q_r0");
    expect(info!.cards.length).toBeGreaterThan(0);
  });

  it("完成 M2 后，下一批卡指向 M3", () => {
    const info = getUpcomingCardInfo(["q_r0", "m0", "m1", "m2"]);
    expect(info!.quest.id).toBe("m3");
  });

  it("全部带卡任务完成后返回 null", () => {
    const allWithCards = ["q_r0", "m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9", "m10", "b2", "b4", "b5"];
    expect(getUpcomingCardInfo(allWithCards)).toBeNull();
  });
});

describe("reviewEngine · 热身回顾", () => {
  it("无到期老卡时，用任务自己的卡做预习提问", () => {
    // 空档案：卡组里没有任何老卡，M2 用自己的卡做学前检索
    const warmup = getWarmupCard(QUEST_BY_ID.m2, {}, [], TODAY);
    expect(warmup).not.toBeNull();
    expect(warmup!.kind).toBe("preview");
    expect(warmup!.card.questId).toBe("m2");
  });

  it("有到期老卡时优先复习（retrieval），且优先技能相关", () => {
    // m2 完成 → card_extern_c 到期；m3 的技能包含 skill_idisposable/raii 等
    const warmup = getWarmupCard(QUEST_BY_ID.m3, {}, ["q_r0", "m0", "m1", "m2"], TODAY);
    expect(warmup).not.toBeNull();
    expect(warmup!.kind).toBe("review");
  });
});
