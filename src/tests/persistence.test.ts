import { describe, expect, it } from "vitest";
import { buildExportPayload, createInitialPlayerState, parseImportedSave } from "@/store/persistence";

describe("persistence · 存档导出/导入", () => {
  it("导出的存档可以完整导入", () => {
    const state = createInitialPlayerState();
    state.wallet.gold = 250;
    state.questCompletions.q_r0 = {
      questId: "q_r0",
      completedAt: "2026-07-03T10:00:00.000Z",
      evidence: { manifesto: "宣言" },
    };
    const json = JSON.stringify(buildExportPayload(state));
    const result = parseImportedSave(json);
    expect(result.ok).toBe(true);
    expect(result.state?.wallet.gold).toBe(250);
    expect(result.state?.questCompletions.q_r0.evidence.manifesto).toBe("宣言");
  });

  it("拒绝非 JSON 内容", () => {
    const result = parseImportedSave("这不是 JSON");
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it("拒绝其他应用的 JSON", () => {
    const result = parseImportedSave(JSON.stringify({ app: "other-app", version: 1, state: {} }));
    expect(result.ok).toBe(false);
    expect(result.error).toContain("仿真铸造学院");
  });

  it("拒绝缺少关键字段的损坏存档", () => {
    const result = parseImportedSave(
      JSON.stringify({ app: "the-simulation-forge-academy", version: 1, state: { wallet: null } }),
    );
    expect(result.ok).toBe(false);
  });

  it("缺失次要字段时用初始值兜底", () => {
    const minimal = {
      app: "the-simulation-forge-academy",
      version: 1,
      exportedAt: "2026-07-03T10:00:00.000Z",
      state: {
        ...createInitialPlayerState(),
        recaps: undefined,
      },
    };
    const result = parseImportedSave(JSON.stringify(minimal));
    expect(result.ok).toBe(true);
    expect(result.state?.recaps).toEqual([]);
  });
});
