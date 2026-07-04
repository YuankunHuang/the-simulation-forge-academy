import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DUNGEON_BY_ID } from "@/content/bonusDungeons";
import { QUEST_BY_ID } from "@/content/quests";
import { SKILL_BY_ID } from "@/content/skills";
import { assembleDefenseText } from "@/engine/evidenceEngine";
import { canCompleteQuest } from "@/engine/questEngine";
import {
  LOW_ENERGY_GOLD,
  REVIEW_GOLD,
  WARMUP_GOLD,
  applyRewards,
  artifactsForQuest,
  computeCompletionRewards,
  levelForXp,
  skillsMadeAvailableBy,
  titleForCompleted,
} from "@/engine/rewardEngine";
import { cardsUnlockedBy, initialCardState, rateCard } from "@/engine/reviewEngine";
import { addQuestToSprint, buildRecap, createSprint } from "@/engine/sprintEngine";
import { isoNow, todayStr } from "@/lib/date";
import { uid } from "@/lib/ids";
import {
  SAVE_STORAGE_KEY,
  buildExportPayload,
  createInitialPlayerState,
  parseImportedSave,
} from "@/store/persistence";
import type { CeremonyPayload, EnergyMode, PlayerState, ReviewRating } from "@/types/domain";

/**
 * playerStore — 唯一存档 + 全部玩家动作。
 * 引擎负责计算，store 负责编排与持久化。
 */

export interface PlayerStore extends PlayerState {
  ceremony: CeremonyPayload | null;

  setEnergyMode: (mode: EnergyMode) => void;
  completeQuest: (questId: string, fields: Record<string, string>) => boolean;
  closeCeremony: () => void;
  /** 深度冲刺必须显式开始：仅选择模式不会开启冲刺 */
  startSprint: () => void;
  endSprint: () => void;

  rateReviewCard: (cardId: string, rating: ReviewRating) => void;
  claimWarmup: (cardId: string, rating: ReviewRating) => void;

  unlockSkill: (skillId: string) => boolean;
  purchaseDungeon: (dungeonId: string) => boolean;
  completeDungeon: (dungeonId: string, note: string) => boolean;

  completeLowEnergyCheckin: (reflection: string) => void;
  addJournalNote: (text: string) => void;

  exportSave: () => string;
  importSave: (json: string) => { ok: boolean; error?: string };
  resetAll: () => void;
}

function markActive(state: Pick<PlayerState, "activeDates">, today: string): string[] {
  const set = new Set(state.activeDates);
  set.add(today);
  return [...set].sort().slice(-60);
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      ...createInitialPlayerState(),
      ceremony: null,

      // 模式只改变推荐节奏与大厅呈现；冲刺由 startSprint 显式开启
      setEnergyMode: (mode) => {
        set({ energyMode: mode });
      },

      startSprint: () => {
        const s = get();
        if (s.sprint) return;
        set({ sprint: createSprint(isoNow()), energyMode: "deep" });
      },

      completeQuest: (questId, fields) => {
        const s = get();
        const quest = QUEST_BY_ID[questId];
        if (!quest) return false;
        const completedIds = Object.keys(s.questCompletions);
        const eligibility = canCompleteQuest(quest, completedIds, fields);
        if (!eligibility.ok) return false;

        const today = todayStr();
        const now = isoNow();
        const { bundle } = computeCompletionRewards(quest, fields);
        const artifacts = artifactsForQuest(questId);
        const newSkills = skillsMadeAvailableBy(questId, completedIds);

        const titleBefore = titleForCompleted(completedIds).titleEn;
        const completedAfter = [...completedIds, questId];
        const titleAfter = titleForCompleted(completedAfter);

        const levelBefore = levelForXp(s.wallet.xp);
        const walletAfter = applyRewards(s.wallet, bundle);
        const levelAfter = levelForXp(walletAfter.xp);

        // 篝火日志：普通任务记第一条反思；Boss 之门把整场答辩存为面试防线记录
        const newJournalEntries: PlayerState["journal"] = [];
        if (quest.type === "boss") {
          const defenseText = assembleDefenseText(quest, fields);
          if (defenseText) {
            newJournalEntries.push({
              id: uid("j"),
              date: today,
              kind: "boss_defense",
              questId,
              text: defenseText,
            });
          }
        } else {
          const reflectionReq = quest.evidenceRequired.find((r) => r.type === "text_reflection");
          const reflectionText = reflectionReq ? (fields[reflectionReq.id] ?? "").trim() : "";
          if (reflectionText) {
            newJournalEntries.push({
              id: uid("j"),
              date: today,
              kind: "reflection",
              questId,
              text: reflectionText,
            });
          }
        }

        const ceremony: CeremonyPayload = {
          questId,
          rewards: bundle,
          artifactIds: artifacts.map((a) => a.id),
          skillsMadeAvailable: newSkills.map((n) => n.id),
          reviewCardIds: cardsUnlockedBy(questId).map((c) => c.id),
          journalEntriesCreated: newJournalEntries.length,
          newTitle: titleAfter.titleEn !== titleBefore ? `${titleAfter.title} · ${titleAfter.titleEn}` : undefined,
          leveledUpTo: levelAfter > levelBefore ? levelAfter : undefined,
        };

        set({
          questCompletions: {
            ...s.questCompletions,
            [questId]: { questId, completedAt: now, evidence: fields },
          },
          wallet: walletAfter,
          journal: [...newJournalEntries, ...s.journal],
          activeDates: markActive(s, today),
          lastActiveDate: today,
          sprint: s.sprint
            ? addQuestToSprint(
                s.sprint,
                questId,
                artifacts.map((a) => a.id),
                bundle,
              )
            : null,
          ceremony,
        });
        return true;
      },

      closeCeremony: () => set({ ceremony: null }),

      endSprint: () => {
        const s = get();
        if (!s.sprint) {
          set({ energyMode: "normal" });
          return;
        }
        // 空冲刺（没完成任何任务）不生成回顾，避免日志噪音
        if (s.sprint.questIds.length === 0) {
          set({ sprint: null, energyMode: "normal" });
          return;
        }
        const completedIds = Object.keys(s.questCompletions);
        const recap = buildRecap(s.sprint, isoNow(), completedIds);
        set({
          recaps: [recap, ...s.recaps],
          sprint: null,
          energyMode: "normal",
        });
      },

      rateReviewCard: (cardId, rating) => {
        const s = get();
        const today = todayStr();
        const prev = s.reviewStates[cardId] ?? initialCardState(cardId, today);
        const next = rateCard(prev, rating, today);
        set({
          reviewStates: { ...s.reviewStates, [cardId]: next },
          wallet: { ...s.wallet, gold: s.wallet.gold + REVIEW_GOLD },
          activeDates: markActive(s, today),
          lastActiveDate: today,
        });
      },

      claimWarmup: (cardId, rating) => {
        const s = get();
        const today = todayStr();
        const prev = s.reviewStates[cardId] ?? initialCardState(cardId, today);
        const next = rateCard(prev, rating, today);
        const alreadyClaimed = s.warmupClaims[cardId] === today;
        set({
          reviewStates: { ...s.reviewStates, [cardId]: next },
          warmupClaims: { ...s.warmupClaims, [cardId]: today },
          wallet: alreadyClaimed ? s.wallet : { ...s.wallet, gold: s.wallet.gold + WARMUP_GOLD },
          activeDates: markActive(s, today),
          lastActiveDate: today,
        });
      },

      unlockSkill: (skillId) => {
        const s = get();
        const node = SKILL_BY_ID[skillId];
        if (!node) return false;
        if (s.unlockedSkillIds.includes(skillId)) return false;
        if (s.wallet.skillPoints < node.cost) return false;
        const completedIds = Object.keys(s.questCompletions);
        const hasEvidence = node.sourceQuestIds.some((q) => completedIds.includes(q));
        if (!hasEvidence) return false;
        set({
          unlockedSkillIds: [...s.unlockedSkillIds, skillId],
          wallet: { ...s.wallet, skillPoints: s.wallet.skillPoints - node.cost },
        });
        return true;
      },

      purchaseDungeon: (dungeonId) => {
        const s = get();
        const dungeon = DUNGEON_BY_ID[dungeonId];
        if (!dungeon) return false;
        if (s.purchasedDungeonIds.includes(dungeonId)) return false;
        if (s.wallet.gold < dungeon.costGold) return false;
        const completedIds = Object.keys(s.questCompletions);
        const unlocked = dungeon.prerequisiteQuestIds.every((q) => completedIds.includes(q));
        if (!unlocked) return false;
        set({
          purchasedDungeonIds: [...s.purchasedDungeonIds, dungeonId],
          wallet: { ...s.wallet, gold: s.wallet.gold - dungeon.costGold },
        });
        return true;
      },

      completeDungeon: (dungeonId, note) => {
        const s = get();
        const dungeon = DUNGEON_BY_ID[dungeonId];
        if (!dungeon) return false;
        if (!s.purchasedDungeonIds.includes(dungeonId)) return false;
        if (s.completedDungeonIds.includes(dungeonId)) return false;
        if (note.trim().length < 10) return false;
        const today = todayStr();
        set({
          completedDungeonIds: [...s.completedDungeonIds, dungeonId],
          wallet: applyRewards(s.wallet, dungeon.completionRewards),
          journal: [
            { id: uid("j"), date: today, kind: "dungeon", text: `【${dungeon.name}】${note.trim()}` },
            ...s.journal,
          ],
          activeDates: markActive(s, today),
          lastActiveDate: today,
        });
        return true;
      },

      completeLowEnergyCheckin: (reflection) => {
        const s = get();
        const today = todayStr();
        if (s.lowEnergyDoneDate === today) return;
        const text = reflection.trim();
        set({
          lowEnergyDoneDate: today,
          wallet: { ...s.wallet, gold: s.wallet.gold + LOW_ENERGY_GOLD },
          journal: text
            ? [{ id: uid("j"), date: today, kind: "low_energy", text }, ...s.journal]
            : s.journal,
          activeDates: markActive(s, today),
          lastActiveDate: today,
        });
      },

      addJournalNote: (text) => {
        const s = get();
        const trimmed = text.trim();
        if (!trimmed) return;
        const today = todayStr();
        set({
          journal: [{ id: uid("j"), date: today, kind: "note", text: trimmed }, ...s.journal],
          activeDates: markActive(s, today),
          lastActiveDate: today,
        });
      },

      exportSave: () => {
        const s = get();
        const { ceremony: _c, ...rest } = s;
        // 只导出数据字段（函数会被 JSON 序列化自然剔除，此处显式过滤 ceremony）
        const state = JSON.parse(JSON.stringify(rest)) as PlayerState;
        return JSON.stringify(buildExportPayload(state), null, 2);
      },

      importSave: (json) => {
        const result = parseImportedSave(json);
        if (!result.ok || !result.state) {
          return { ok: false, error: result.error };
        }
        set({ ...result.state, ceremony: null });
        return { ok: true };
      },

      resetAll: () => {
        set({ ...createInitialPlayerState(), ceremony: null });
      },
    }),
    {
      name: SAVE_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const { ceremony: _ceremony, ...rest } = state;
        return rest as PlayerStore;
      },
    },
  ),
);

/** 常用派生选择器 */
export function selectCompletedIds(s: PlayerStore): string[] {
  return Object.keys(s.questCompletions);
}
