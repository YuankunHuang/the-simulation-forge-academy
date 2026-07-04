import { describe, expect, it } from "vitest";
import { QUEST_BY_ID } from "@/content/quests";
import {
  getAvailableQuests,
  getBossGateChecklist,
  getCurrentRegion,
  getQuestStatus,
  getRegionProgress,
  getRegionVisibility,
  isRegionUnlocked,
} from "@/engine/unlockEngine";

describe("unlockEngine · 区域迷雾", () => {
  it("新玩家：炉火大厅解锁，新手村为剪影预览，其余全部迷雾", () => {
    const vis = getRegionVisibility([]);
    expect(vis.hearth_hall).toBe("unlocked");
    expect(vis.bridge_village).toBe("preview");
    expect(vis.benchmark_plains).toBe("fogged");
    expect(vis.fixed_timestep_garden).toBe("fogged");
    expect(vis.portfolio_hall).toBe("fogged");
  });

  it("完成 R0 后：新手村解锁，平原变为预览", () => {
    const vis = getRegionVisibility(["q_r0"]);
    expect(vis.bridge_village).toBe("unlocked");
    expect(vis.benchmark_plains).toBe("preview");
    expect(vis.layout_archives).toBe("fogged");
  });

  it("越过初次信号之门后平原解锁", () => {
    const completed = ["q_r0", "m0", "m1", "m2", "m3", "boss_bridge"];
    expect(isRegionUnlocked("benchmark_plains", completed)).toBe(true);
    const vis = getRegionVisibility(completed);
    expect(vis.layout_archives).toBe("preview");
  });

  it("Act II 区域在 MVP 中永不解锁（只可能是预览或迷雾）", () => {
    const allAct1 = [
      "q_r0", "m0", "m1", "m2", "m3", "boss_bridge",
      "m4", "m5", "m6", "m7", "m8", "boss_benchmark",
      "m9", "boss_layout", "m10", "boss_safety",
      "m11", "boss_package", "m12", "boss_mobile", "m13",
    ];
    const vis = getRegionVisibility(allAct1);
    expect(vis.observatory_annex).toBe("unlocked");
    expect(vis.fixed_timestep_garden).toBe("preview");
    expect(vis.input_log_workshop).toBe("fogged");
  });
});

describe("unlockEngine · 任务状态与防跳级", () => {
  it("R0 是新玩家唯一可接的任务", () => {
    const available = getAvailableQuests([]);
    expect(available.map((q) => q.id)).toEqual(["q_r0"]);
  });

  it("前置未完成时任务锁定，并列出缺失前置", () => {
    const info = getQuestStatus(QUEST_BY_ID.m2, ["q_r0", "m0"]);
    expect(info.status).toBe("locked");
    expect(info.missingPrereqIds).toEqual(["m1"]);
  });

  it("不能跳过区域：即使凭空完成 M3，M4 仍因 Boss 门锁定", () => {
    const info = getQuestStatus(QUEST_BY_ID.m4, ["q_r0", "m0", "m1", "m2", "m3"]);
    expect(info.status).toBe("locked");
    expect(info.regionLocked).toBe(true);
    expect(info.missingPrereqIds).toContain("boss_bridge");
  });

  it("Boss 之门需要区域内全部任务完成", () => {
    const notReady = getQuestStatus(QUEST_BY_ID.boss_bridge, ["q_r0", "m0", "m1"]);
    expect(notReady.status).toBe("locked");
    const ready = getQuestStatus(QUEST_BY_ID.boss_bridge, ["q_r0", "m0", "m1", "m2", "m3"]);
    expect(ready.status).toBe("available");
  });

  it("Boss 门清单反映各前置的完成情况", () => {
    const checklist = getBossGateChecklist(QUEST_BY_ID.boss_bridge, ["q_r0", "m0", "m1"]);
    const met = checklist.filter((c) => c.met).length;
    expect(met).toBe(2); // m0、m1
    expect(checklist.length).toBeGreaterThanOrEqual(4 + 4); // 4 前置 + 4 证据项
  });

  it("区域进度统计正确", () => {
    const progress = getRegionProgress("bridge_village", ["q_r0", "m0", "m1"]);
    expect(progress).toEqual({ done: 2, total: 5 }); // m0-m3 + boss
  });

  it("当前区域跟随第一个可接任务", () => {
    expect(getCurrentRegion([]).id).toBe("hearth_hall");
    expect(getCurrentRegion(["q_r0"]).id).toBe("bridge_village");
  });
});
